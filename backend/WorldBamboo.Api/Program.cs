using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorldBamboo.Api.Contracts;
using WorldBamboo.Api.Data;
using WorldBamboo.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("PilotDb") ?? "Data Source=pilot.db"));

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("PilotFrontend", policy =>
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("PilotFrontend");

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
}

var api = app.MapGroup("/api");

api.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    mode = "STATIC_QR_MANUAL_VERIFICATION_PILOT",
    utc = DateTimeOffset.UtcNow
}));

api.MapGet("/pilot/config", (IConfiguration config) => Results.Ok(new
{
    eventName = config["Pilot:EventName"] ?? "World Bamboo Day 2026 — Bohol",
    eventDate = config["Pilot:EventDate"] ?? "2026-09-18",
    location = config["Pilot:Location"] ?? "Loboc, Bohol",
    paymentMode = "STATIC_QR_MANUAL_VERIFICATION",
    staticQrImageUrl = config["Pilot:StaticQrImageUrl"] ?? "http://localhost:3000/placeholders/pilot-payment-qr.svg",
    paymentAccountLabel = config["Pilot:PaymentAccountLabel"] ?? "TEST QR — replace locally",
    expectedAmount = config.GetValue<decimal?>("Pilot:ExpectedAmount"),
    warning = "Pilot only. This flow is not approved for production or official government collections."
}));

api.MapPost("/registrations", async (CreateRegistrationRequest request, AppDbContext db) =>
{
    var errors = ValidateRegistration(request);
    if (errors.Count > 0)
        return Results.ValidationProblem(errors);

    string reference;
    do
    {
        reference = NewReference();
    } while (await db.Registrations.AnyAsync(x => x.Reference == reference));

    var registration = new Registration
    {
        Reference = reference,
        LookupToken = GenerateToken(),
        EventQrToken = GenerateToken(),
        FullName = Normalize(request.FullName),
        Email = Normalize(request.Email).ToLowerInvariant(),
        Mobile = Normalize(request.Mobile),
        Municipality = Normalize(request.Municipality),
        Organization = NullIfBlank(request.Organization),
        Category = Normalize(request.Category),
        Participation = Normalize(request.Participation),
        BambooUnits = Math.Clamp(request.BambooUnits, 0, 999),
        Notes = NullIfBlank(request.Notes),
        RegistrationStatus = RegistrationStatuses.AwaitingPayment,
        PaymentStatus = PaymentStatuses.Pending
    };

    db.Registrations.Add(registration);
    AddAudit(db, "REGISTRATION_CREATED", "Registration", registration.Reference, "participant", registration.Participation);
    await db.SaveChangesAsync();

    return Results.Created($"/api/registrations/{registration.Reference}", new
    {
        registration.Reference,
        registration.LookupToken,
        registration.RegistrationStatus,
        registration.PaymentStatus,
        registration.CreatedAtUtc
    });
});

api.MapGet("/registrations/{reference}", async (string reference, string token, AppDbContext db) =>
{
    var registration = await db.Registrations
        .AsNoTracking()
        .Include(x => x.PaymentSubmissions)
        .Include(x => x.CheckIn)
        .SingleOrDefaultAsync(x => x.Reference == reference && x.LookupToken == token);

    if (registration is null)
        return Results.NotFound(new { message = "Registration not found." });

    var latestPayment = registration.PaymentSubmissions
        .OrderByDescending(x => x.SubmittedAtUtc)
        .FirstOrDefault();

    return Results.Ok(new
    {
        registration.Reference,
        registration.FullName,
        registration.Email,
        registration.Mobile,
        registration.Municipality,
        registration.Organization,
        registration.Category,
        registration.Participation,
        registration.BambooUnits,
        registration.RegistrationStatus,
        registration.PaymentStatus,
        paymentSubmission = latestPayment is null ? null : new
        {
            latestPayment.Id,
            latestPayment.Method,
            latestPayment.PayerReference,
            latestPayment.ReportedAmount,
            latestPayment.Status,
            latestPayment.SubmittedAtUtc,
            latestPayment.ReviewedAtUtc,
            latestPayment.ReviewNote
        },
        checkedInAtUtc = registration.CheckIn?.CheckedInAtUtc,
        eventQrToken = registration.RegistrationStatus == RegistrationStatuses.Confirmed
            ? registration.EventQrToken
            : null,
        registration.CreatedAtUtc,
        registration.UpdatedAtUtc
    });
});

api.MapPost("/registrations/{reference}/payment-submissions", async (
    string reference,
    string token,
    SubmitPaymentRequest request,
    AppDbContext db) =>
{
    var registration = await db.Registrations
        .Include(x => x.PaymentSubmissions)
        .SingleOrDefaultAsync(x => x.Reference == reference && x.LookupToken == token);

    if (registration is null)
        return Results.NotFound(new { message = "Registration not found." });

    if (registration.PaymentStatus == PaymentStatuses.Confirmed)
        return Results.Conflict(new { message = "Payment is already confirmed." });

    if (string.IsNullOrWhiteSpace(request.PayerReference))
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["payerReference"] = ["A payment reference is required for manual verification."]
        });

    var pending = registration.PaymentSubmissions
        .Any(x => x.Status == PaymentSubmissionStatuses.PendingReview);

    if (pending)
        return Results.Conflict(new { message = "A payment submission is already awaiting review." });

    var submission = new PaymentSubmission
    {
        RegistrationId = registration.Id,
        PayerReference = Normalize(request.PayerReference),
        ReportedAmount = request.ReportedAmount,
        Note = NullIfBlank(request.Note),
        Status = PaymentSubmissionStatuses.PendingReview
    };

    registration.PaymentSubmissions.Add(submission);
    registration.PaymentStatus = PaymentStatuses.ForManualReview;
    registration.RegistrationStatus = RegistrationStatuses.PaymentForVerification;
    registration.UpdatedAtUtc = DateTimeOffset.UtcNow;

    AddAudit(db, "PAYMENT_SUBMITTED", "Registration", registration.Reference, "participant", submission.PayerReference);
    await db.SaveChangesAsync();

    return Results.Accepted($"/api/registrations/{registration.Reference}", new
    {
        registration.Reference,
        registration.RegistrationStatus,
        registration.PaymentStatus,
        submission.Id,
        submission.Status,
        submission.SubmittedAtUtc
    });
});

var admin = api.MapGroup("/admin");

admin.MapGet("/dashboard", async (HttpRequest http, IConfiguration config, AppDbContext db) =>
{
    if (RequireAdmin(http, config) is { } denied) return denied;

    var total = await db.Registrations.CountAsync();
    var confirmed = await db.Registrations.CountAsync(x => x.RegistrationStatus == RegistrationStatuses.Confirmed);
    var awaitingReview = await db.Registrations.CountAsync(x => x.PaymentStatus == PaymentStatuses.ForManualReview);
    var checkedIn = await db.CheckIns.CountAsync();
    var bambooUnits = await db.Registrations
        .Where(x => x.RegistrationStatus == RegistrationStatuses.Confirmed)
        .SumAsync(x => (int?)x.BambooUnits) ?? 0;

    return Results.Ok(new { total, confirmed, awaitingReview, checkedIn, bambooUnits });
});

admin.MapGet("/registrations", async (
    HttpRequest http,
    IConfiguration config,
    AppDbContext db,
    string? q,
    string? status,
    string? paymentStatus) =>
{
    if (RequireAdmin(http, config) is { } denied) return denied;

    var query = db.Registrations
        .AsNoTracking()
        .Include(x => x.PaymentSubmissions)
        .Include(x => x.CheckIn)
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(q))
    {
        var term = $"%{q.Trim()}%";
        query = query.Where(x =>
            EF.Functions.Like(x.Reference, term) ||
            EF.Functions.Like(x.FullName, term) ||
            EF.Functions.Like(x.Email, term) ||
            EF.Functions.Like(x.Mobile, term));
    }

    if (!string.IsNullOrWhiteSpace(status))
        query = query.Where(x => x.RegistrationStatus == status.Trim());

    if (!string.IsNullOrWhiteSpace(paymentStatus))
        query = query.Where(x => x.PaymentStatus == paymentStatus.Trim());

    var registrations = await query
        .OrderByDescending(x => x.CreatedAtUtc)
        .Take(500)
        .ToListAsync();

    return Results.Ok(registrations.Select(x =>
    {
        var latestPayment = x.PaymentSubmissions.OrderByDescending(p => p.SubmittedAtUtc).FirstOrDefault();
        return new
        {
            x.Reference,
            x.FullName,
            x.Email,
            x.Mobile,
            x.Municipality,
            x.Organization,
            x.Category,
            x.Participation,
            x.BambooUnits,
            x.RegistrationStatus,
            x.PaymentStatus,
            payerReference = latestPayment?.PayerReference,
            reportedAmount = latestPayment?.ReportedAmount,
            paymentSubmissionStatus = latestPayment?.Status,
            checkedInAtUtc = x.CheckIn?.CheckedInAtUtc,
            x.CreatedAtUtc
        };
    }));
});

admin.MapPost("/registrations/{reference}/payment/approve", async (
    string reference,
    ReviewPaymentRequest request,
    HttpRequest http,
    IConfiguration config,
    AppDbContext db) =>
{
    if (RequireAdmin(http, config) is { } denied) return denied;

    var registration = await db.Registrations
        .Include(x => x.PaymentSubmissions)
        .SingleOrDefaultAsync(x => x.Reference == reference);

    if (registration is null)
        return Results.NotFound(new { message = "Registration not found." });

    var submission = registration.PaymentSubmissions
        .Where(x => x.Status == PaymentSubmissionStatuses.PendingReview)
        .OrderByDescending(x => x.SubmittedAtUtc)
        .FirstOrDefault();

    if (submission is null)
        return Results.Conflict(new { message = "No payment submission is awaiting review." });

    var actor = NullIfBlank(request.ReviewedBy) ?? "pilot-admin";
    submission.Status = PaymentSubmissionStatuses.Approved;
    submission.ReviewedAtUtc = DateTimeOffset.UtcNow;
    submission.ReviewedBy = actor;
    submission.ReviewNote = NullIfBlank(request.ReviewNote);

    registration.PaymentStatus = PaymentStatuses.Confirmed;
    registration.RegistrationStatus = RegistrationStatuses.Confirmed;
    registration.UpdatedAtUtc = DateTimeOffset.UtcNow;

    AddAudit(db, "PAYMENT_APPROVED", "Registration", registration.Reference, actor, submission.ReviewNote);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        registration.Reference,
        registration.RegistrationStatus,
        registration.PaymentStatus,
        registration.EventQrToken
    });
});

admin.MapPost("/registrations/{reference}/payment/reject", async (
    string reference,
    ReviewPaymentRequest request,
    HttpRequest http,
    IConfiguration config,
    AppDbContext db) =>
{
    if (RequireAdmin(http, config) is { } denied) return denied;

    var registration = await db.Registrations
        .Include(x => x.PaymentSubmissions)
        .SingleOrDefaultAsync(x => x.Reference == reference);

    if (registration is null)
        return Results.NotFound(new { message = "Registration not found." });

    var submission = registration.PaymentSubmissions
        .Where(x => x.Status == PaymentSubmissionStatuses.PendingReview)
        .OrderByDescending(x => x.SubmittedAtUtc)
        .FirstOrDefault();

    if (submission is null)
        return Results.Conflict(new { message = "No payment submission is awaiting review." });

    var actor = NullIfBlank(request.ReviewedBy) ?? "pilot-admin";
    submission.Status = PaymentSubmissionStatuses.Rejected;
    submission.ReviewedAtUtc = DateTimeOffset.UtcNow;
    submission.ReviewedBy = actor;
    submission.ReviewNote = NullIfBlank(request.ReviewNote) ?? "Rejected during pilot verification.";

    registration.PaymentStatus = PaymentStatuses.Rejected;
    registration.RegistrationStatus = RegistrationStatuses.AwaitingPayment;
    registration.UpdatedAtUtc = DateTimeOffset.UtcNow;

    AddAudit(db, "PAYMENT_REJECTED", "Registration", registration.Reference, actor, submission.ReviewNote);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        registration.Reference,
        registration.RegistrationStatus,
        registration.PaymentStatus
    });
});

admin.MapPost("/check-ins", async (
    CheckInRequest request,
    HttpRequest http,
    IConfiguration config,
    AppDbContext db) =>
{
    if (RequireAdmin(http, config) is { } denied) return denied;

    if (string.IsNullOrWhiteSpace(request.EventQrToken))
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["eventQrToken"] = ["An event QR token is required."]
        });

    var registration = await db.Registrations
        .Include(x => x.CheckIn)
        .SingleOrDefaultAsync(x => x.EventQrToken == request.EventQrToken.Trim());

    if (registration is null)
        return Results.NotFound(new { message = "Event token not found." });

    if (registration.RegistrationStatus != RegistrationStatuses.Confirmed ||
        registration.PaymentStatus != PaymentStatuses.Confirmed)
        return Results.Conflict(new { message = "Registration is not confirmed for check-in." });

    if (registration.CheckIn is not null)
        return Results.Ok(new
        {
            alreadyCheckedIn = true,
            registration.Reference,
            registration.FullName,
            registration.CheckIn.CheckedInAtUtc,
            registration.CheckIn.Operator
        });

    var checkIn = new CheckIn
    {
        RegistrationId = registration.Id,
        Operator = NullIfBlank(request.Operator) ?? "pilot-admin"
    };

    db.CheckIns.Add(checkIn);
    registration.UpdatedAtUtc = DateTimeOffset.UtcNow;
    AddAudit(db, "PARTICIPANT_CHECKED_IN", "Registration", registration.Reference, checkIn.Operator, null);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        alreadyCheckedIn = false,
        registration.Reference,
        registration.FullName,
        registration.Organization,
        registration.BambooUnits,
        checkIn.CheckedInAtUtc,
        checkIn.Operator
    });
});

app.Run();

static Dictionary<string, string[]> ValidateRegistration(CreateRegistrationRequest request)
{
    var errors = new Dictionary<string, string[]>();
    if (string.IsNullOrWhiteSpace(request.FullName)) errors["fullName"] = ["Full name is required."];
    if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@')) errors["email"] = ["A valid email is required."];
    if (string.IsNullOrWhiteSpace(request.Mobile)) errors["mobile"] = ["Mobile number is required."];
    if (string.IsNullOrWhiteSpace(request.Municipality)) errors["municipality"] = ["Municipality or city is required."];
    if (string.IsNullOrWhiteSpace(request.Category)) errors["category"] = ["Participant category is required."];
    if (string.IsNullOrWhiteSpace(request.Participation)) errors["participation"] = ["Participation type is required."];
    if (request.BambooUnits < 0 || request.BambooUnits > 999) errors["bambooUnits"] = ["Bamboo units must be between 0 and 999."];
    return errors;
}

static IResult? RequireAdmin(HttpRequest request, IConfiguration configuration)
{
    var expected = configuration["Pilot:AdminKey"];
    if (string.IsNullOrWhiteSpace(expected))
        return Results.Problem("Pilot admin key is not configured.", statusCode: StatusCodes.Status500InternalServerError);

    var supplied = request.Headers["X-Pilot-Admin-Key"].ToString();
    if (string.IsNullOrWhiteSpace(supplied))
        return Results.Unauthorized();

    var expectedBytes = Encoding.UTF8.GetBytes(expected);
    var suppliedBytes = Encoding.UTF8.GetBytes(supplied);
    return CryptographicOperations.FixedTimeEquals(expectedBytes, suppliedBytes)
        ? null
        : Results.Unauthorized();
}

static void AddAudit(AppDbContext db, string action, string entityType, string entityReference, string actor, string? detail)
{
    db.AuditEntries.Add(new AuditEntry
    {
        Action = action,
        EntityType = entityType,
        EntityReference = entityReference,
        Actor = actor,
        Detail = detail
    });
}

static string NewReference() => $"WBD26-{DateTimeOffset.UtcNow:MMddHHmm}-{RandomNumberGenerator.GetInt32(100, 1000)}";
static string GenerateToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(24)).ToLowerInvariant();
static string Normalize(string value) => value.Trim();
static string? NullIfBlank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
