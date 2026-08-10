"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { pilotApi, PilotConfig, PilotRegistrationCreated, PilotRegistrationStatus } from "@/lib/pilot-api";

type FormState = {
  fullName: string;
  email: string;
  mobile: string;
  municipality: string;
  organization: string;
  category: string;
  participation: string;
  bambooUnits: number;
  notes: string;
};

const initial: FormState = {
  fullName: "",
  email: "",
  mobile: "",
  municipality: "",
  organization: "",
  category: "Individual",
  participation: "Celebration participant",
  bambooUnits: 1,
  notes: "",
};

export default function PilotRegisterPage() {
  const [config, setConfig] = useState<PilotConfig | null>(null);
  const [form, setForm] = useState<FormState>(initial);
  const [created, setCreated] = useState<PilotRegistrationCreated | null>(null);
  const [status, setStatus] = useState<PilotRegistrationStatus | null>(null);
  const [payerReference, setPayerReference] = useState("");
  const [reportedAmount, setReportedAmount] = useState("");
  const [phase, setPhase] = useState<"details" | "payment" | "status">("details");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    pilotApi.config().then(setConfig).catch((err: Error) => setError(err.message));
    const saved = localStorage.getItem("wbd-pilot-registration");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PilotRegistrationCreated;
        setCreated(parsed);
        setPhase("status");
      } catch {
        localStorage.removeItem("wbd-pilot-registration");
      }
    }
  }, []);

  useEffect(() => {
    if (phase === "status" && created) refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, created]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitRegistration(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await pilotApi.createRegistration(form);
      setCreated(result);
      localStorage.setItem("wbd-pilot-registration", JSON.stringify(result));
      setPhase("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPayment(event: FormEvent) {
    event.preventDefault();
    if (!created) return;
    setBusy(true);
    setError("");
    try {
      await pilotApi.submitPayment(created.reference, created.lookupToken, {
        payerReference,
        reportedAmount: reportedAmount ? Number(reportedAmount) : null,
        note: "Static QR pilot submission",
      });
      setPhase("status");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment submission failed.");
    } finally {
      setBusy(false);
    }
  }

  async function refreshStatus() {
    if (!created) return;
    setBusy(true);
    setError("");
    try {
      setStatus(await pilotApi.registrationStatus(created.reference, created.lookupToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh registration.");
    } finally {
      setBusy(false);
    }
  }

  function resetPilot() {
    localStorage.removeItem("wbd-pilot-registration");
    setCreated(null);
    setStatus(null);
    setPayerReference("");
    setReportedAmount("");
    setForm(initial);
    setPhase("details");
    setError("");
  }

  return (
    <main className="pilot-page shell">
      <div className="pilot-warning">
        <strong>LOCAL STATIC-QR PILOT</strong>
        <span>Real backend persistence. Manual payment verification. Not approved for official collections.</span>
      </div>

      <header className="pilot-head">
        <div>
          <span className="eyebrow">WORLD BAMBOO DAY 2026 · PILOT VERTICAL SLICE</span>
          <h1>Register. Submit a test reference. Verify it manually.</h1>
          <p>This branch connects the frontend to the local .NET API and SQLite database. The payment QR is intentionally static for controlled testing.</p>
        </div>
        <div className="pilot-head-links">
          <Link href="/pilot/admin">Pilot admin →</Link>
          <Link href="/proposal">Proposal board →</Link>
        </div>
      </header>

      <div className="pilot-progress" aria-label="Pilot registration progress">
        <div className={phase === "details" ? "active" : "done"}><span>01</span><strong>Participant</strong></div>
        <div className={phase === "payment" ? "active" : phase === "status" ? "done" : ""}><span>02</span><strong>Static payment</strong></div>
        <div className={phase === "status" ? "active" : ""}><span>03</span><strong>Verification</strong></div>
      </div>

      {error && <div className="pilot-error">{error}</div>}

      {phase === "details" && (
        <form className="pilot-panel" onSubmit={submitRegistration}>
          <div className="pilot-panel-head"><span>01</span><div><h2>Participant registration</h2><p>This record is saved to the local SQLite pilot database.</p></div></div>
          <div className="form-grid">
            <Field label="Full name *"><input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Juan Dela Cruz" /></Field>
            <Field label="Email *"><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="juan@example.com" /></Field>
            <Field label="Mobile *"><input required value={form.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="09XX XXX XXXX" /></Field>
            <Field label="Municipality / City *"><input required value={form.municipality} onChange={(e) => update("municipality", e.target.value)} placeholder="Loboc, Bohol" /></Field>
            <Field label="Organization"><input value={form.organization} onChange={(e) => update("organization", e.target.value)} placeholder="Optional" /></Field>
            <Field label="Participant category"><select value={form.category} onChange={(e) => update("category", e.target.value)}>{["Individual", "Student", "Government", "Private Sector", "NGO / Civic Organization", "Bamboo Grower", "Bamboo Enterprise", "Volunteer", "Other"].map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Participation"><select value={form.participation} onChange={(e) => update("participation", e.target.value)}><option>Celebration participant</option><option>Bamboo commitment</option><option>Organization / delegation</option></select></Field>
            <Field label="Bamboo units"><input type="number" min="0" max="999" value={form.bambooUnits} onChange={(e) => update("bambooUnits", Number(e.target.value))} /></Field>
            <Field label="Operational note"><textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Optional pilot note" /></Field>
          </div>
          <div className="pilot-actions"><span>Data remains on your local API/database unless you deploy this pilot elsewhere.</span><button className="button primary" disabled={busy}>{busy ? "Saving…" : "Create pilot registration →"}</button></div>
        </form>
      )}

      {phase === "payment" && created && (
        <form className="pilot-panel" onSubmit={submitPayment}>
          <div className="pilot-panel-head"><span>02</span><div><h2>Static QR payment test</h2><p>Use only a controlled test transaction if you replace this placeholder with your own QR.</p></div></div>

          <div className="pilot-payment-grid">
            <div className="pilot-qr-card">
              <div className="pilot-qr-image-wrap">
                {config?.staticQrImageUrl ? <img src={config.staticQrImageUrl} alt="Configured pilot payment QR" /> : <div className="pilot-qr-loading">Loading QR configuration…</div>}
              </div>
              <span>{config?.paymentAccountLabel ?? "Pilot payment QR"}</span>
              <strong>{config?.expectedAmount != null ? `₱${config.expectedAmount.toFixed(2)} test amount` : "Test amount not configured"}</strong>
              <small>Replace the configured QR locally. Do not use this pilot path as the event&apos;s production collection mechanism.</small>
            </div>

            <div className="pilot-payment-form">
              <div className="pilot-reference"><span>REGISTRATION REFERENCE</span><strong>{created.reference}</strong></div>
              <Field label="Payment / transaction reference *"><input required value={payerReference} onChange={(e) => setPayerReference(e.target.value)} placeholder="Enter the reference visible in your wallet/bank" /></Field>
              <Field label="Reported amount"><input type="number" min="0" step="0.01" value={reportedAmount} onChange={(e) => setReportedAmount(e.target.value)} placeholder={config?.expectedAmount?.toString() ?? "Optional for pilot"} /></Field>
              <div className="pilot-flow-note"><strong>What happens next?</strong><p>The API marks this registration <b>FOR_MANUAL_REVIEW</b>. The pilot admin checks the receiving account independently, then approves or rejects the submission.</p></div>
              <div className="pilot-actions"><button type="button" className="button quiet" onClick={() => setPhase("details")}>← Back</button><button className="button primary" disabled={busy}>{busy ? "Submitting…" : "Submit for verification →"}</button></div>
            </div>
          </div>
        </form>
      )}

      {phase === "status" && created && (
        <section className="pilot-panel">
          <div className="pilot-panel-head"><span>03</span><div><h2>Registration status</h2><p>The participant can refresh this view after the administrator verifies the test transaction.</p></div></div>

          <div className="pilot-status-grid">
            <StatusItem label="Reference" value={status?.reference ?? created.reference} />
            <StatusItem label="Registration" value={status?.registrationStatus ?? created.registrationStatus} />
            <StatusItem label="Payment" value={status?.paymentStatus ?? created.paymentStatus} />
            <StatusItem label="Payment reference" value={status?.paymentSubmission?.payerReference ?? "—"} />
          </div>

          {status?.registrationStatus === "CONFIRMED" && status.eventQrToken ? (
            <div className="pilot-confirmed">
              <span>CONFIRMED</span>
              <h3>Payment approved. Event admission is unlocked.</h3>
              <p>For this pilot, the event token is shown as text. A production build should render it as a proper opaque event QR and never reuse the payment QR.</p>
              <code>{status.eventQrToken}</code>
              <small>Use this token in Pilot Admin → Check-in to test the full transaction-to-attendance path.</small>
            </div>
          ) : (
            <div className="pilot-waiting"><strong>Waiting for manual verification</strong><p>Open the pilot admin in another tab, verify the test payment against the receiving account, approve it, then refresh this status.</p></div>
          )}

          <div className="pilot-actions">
            <button className="button quiet" onClick={resetPilot}>Start another pilot record</button>
            <button className="button primary" onClick={refreshStatus} disabled={busy}>{busy ? "Refreshing…" : "Refresh status"}</button>
          </div>
        </section>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
