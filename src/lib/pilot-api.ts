export const PILOT_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5090";

export type PilotConfig = {
  eventName: string;
  eventDate: string;
  location: string;
  paymentMode: string;
  staticQrImageUrl: string;
  paymentAccountLabel: string;
  expectedAmount: number | null;
  warning: string;
};

export type PilotRegistrationCreated = {
  reference: string;
  lookupToken: string;
  registrationStatus: string;
  paymentStatus: string;
  createdAtUtc: string;
};

export type PilotRegistrationStatus = {
  reference: string;
  fullName: string;
  email: string;
  mobile: string;
  municipality: string;
  organization?: string | null;
  category: string;
  participation: string;
  bambooUnits: number;
  registrationStatus: string;
  paymentStatus: string;
  paymentSubmission?: {
    id: string;
    method: string;
    payerReference: string;
    reportedAmount?: number | null;
    status: string;
    submittedAtUtc: string;
    reviewedAtUtc?: string | null;
    reviewNote?: string | null;
  } | null;
  checkedInAtUtc?: string | null;
  eventQrToken?: string | null;
};

export type PilotAdminRegistration = {
  reference: string;
  fullName: string;
  email: string;
  mobile: string;
  municipality: string;
  organization?: string | null;
  category: string;
  participation: string;
  bambooUnits: number;
  registrationStatus: string;
  paymentStatus: string;
  payerReference?: string | null;
  reportedAmount?: number | null;
  paymentSubmissionStatus?: string | null;
  checkedInAtUtc?: string | null;
  createdAtUtc: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${PILOT_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; title?: string } | null;
    throw new Error(body?.message ?? body?.title ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const pilotApi = {
  config: () => request<PilotConfig>("/api/pilot/config"),

  createRegistration: (body: Record<string, unknown>) =>
    request<PilotRegistrationCreated>("/api/registrations", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  registrationStatus: (reference: string, lookupToken: string) =>
    request<PilotRegistrationStatus>(`/api/registrations/${encodeURIComponent(reference)}?token=${encodeURIComponent(lookupToken)}`),

  submitPayment: (reference: string, lookupToken: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/api/registrations/${encodeURIComponent(reference)}/payment-submissions?token=${encodeURIComponent(lookupToken)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  adminDashboard: (adminKey: string) =>
    request<{ total: number; confirmed: number; awaitingReview: number; checkedIn: number; bambooUnits: number }>("/api/admin/dashboard", {
      headers: { "X-Pilot-Admin-Key": adminKey },
    }),

  adminRegistrations: (adminKey: string) =>
    request<PilotAdminRegistration[]>("/api/admin/registrations", {
      headers: { "X-Pilot-Admin-Key": adminKey },
    }),

  reviewPayment: (reference: string, adminKey: string, action: "approve" | "reject", reviewNote?: string) =>
    request<Record<string, unknown>>(`/api/admin/registrations/${encodeURIComponent(reference)}/payment/${action}`, {
      method: "POST",
      headers: { "X-Pilot-Admin-Key": adminKey },
      body: JSON.stringify({ reviewedBy: "pilot-admin-ui", reviewNote: reviewNote ?? null }),
    }),

  checkIn: (eventQrToken: string, adminKey: string) =>
    request<Record<string, unknown>>("/api/admin/check-ins", {
      method: "POST",
      headers: { "X-Pilot-Admin-Key": adminKey },
      body: JSON.stringify({ eventQrToken, operator: "pilot-admin-ui" }),
    }),
};
