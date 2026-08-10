namespace WorldBamboo.Api.Models;

public static class RegistrationStatuses
{
    public const string AwaitingPayment = "AWAITING_PAYMENT";
    public const string PaymentForVerification = "PAYMENT_FOR_VERIFICATION";
    public const string Confirmed = "CONFIRMED";
    public const string Cancelled = "CANCELLED";
}

public static class PaymentStatuses
{
    public const string Pending = "PENDING";
    public const string ForManualReview = "FOR_MANUAL_REVIEW";
    public const string Confirmed = "CONFIRMED";
    public const string Rejected = "REJECTED";
}

public static class PaymentSubmissionStatuses
{
    public const string PendingReview = "PENDING_REVIEW";
    public const string Approved = "APPROVED";
    public const string Rejected = "REJECTED";
}

public sealed class Registration
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Reference { get; set; } = string.Empty;
    public string LookupToken { get; set; } = string.Empty;
    public string EventQrToken { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;
    public string Municipality { get; set; } = string.Empty;
    public string? Organization { get; set; }
    public string Category { get; set; } = "Individual";
    public string Participation { get; set; } = "Celebration participant";
    public int BambooUnits { get; set; } = 1;
    public string? Notes { get; set; }

    public string RegistrationStatus { get; set; } = RegistrationStatuses.AwaitingPayment;
    public string PaymentStatus { get; set; } = PaymentStatuses.Pending;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public List<PaymentSubmission> PaymentSubmissions { get; set; } = [];
    public CheckIn? CheckIn { get; set; }
}

public sealed class PaymentSubmission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RegistrationId { get; set; }
    public Registration Registration { get; set; } = null!;

    public string Method { get; set; } = "STATIC_QR";
    public string PayerReference { get; set; } = string.Empty;
    public decimal? ReportedAmount { get; set; }
    public string? Note { get; set; }
    public string Status { get; set; } = PaymentSubmissionStatuses.PendingReview;
    public DateTimeOffset SubmittedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ReviewedAtUtc { get; set; }
    public string? ReviewedBy { get; set; }
    public string? ReviewNote { get; set; }
}

public sealed class CheckIn
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RegistrationId { get; set; }
    public Registration Registration { get; set; } = null!;
    public DateTimeOffset CheckedInAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public string Operator { get; set; } = "pilot-admin";
}

public sealed class AuditEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityReference { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public string? Detail { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}
