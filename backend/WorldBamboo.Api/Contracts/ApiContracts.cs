namespace WorldBamboo.Api.Contracts;

public sealed record CreateRegistrationRequest(
    string FullName,
    string Email,
    string Mobile,
    string Municipality,
    string? Organization,
    string Category,
    string Participation,
    int BambooUnits,
    string? Notes);

public sealed record SubmitPaymentRequest(
    string PayerReference,
    decimal? ReportedAmount,
    string? Note);

public sealed record ReviewPaymentRequest(
    string? ReviewedBy,
    string? ReviewNote);

public sealed record CheckInRequest(
    string EventQrToken,
    string? Operator);
