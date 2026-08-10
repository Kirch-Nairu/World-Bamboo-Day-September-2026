"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { pilotApi, PilotAdminRegistration } from "@/lib/pilot-api";

type Dashboard = { total: number; confirmed: number; awaitingReview: number; checkedIn: number; bambooUnits: number };

export default function PilotAdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [registrations, setRegistrations] = useState<PilotAdminRegistration[]>([]);
  const [eventQrToken, setEventQrToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAdminKey(sessionStorage.getItem("wbd-pilot-admin-key") ?? "");
  }, []);

  async function load(event?: FormEvent) {
    event?.preventDefault();
    if (!adminKey) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      sessionStorage.setItem("wbd-pilot-admin-key", adminKey);
      const [metrics, records] = await Promise.all([
        pilotApi.adminDashboard(adminKey),
        pilotApi.adminRegistrations(adminKey),
      ]);
      setDashboard(metrics);
      setRegistrations(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pilot admin.");
    } finally {
      setBusy(false);
    }
  }

  async function review(reference: string, action: "approve" | "reject") {
    const note = window.prompt(`${action === "approve" ? "Approval" : "Rejection"} note (optional):`) ?? undefined;
    setBusy(true);
    setError("");
    try {
      await pilotApi.reviewPayment(reference, adminKey, action, note);
      setMessage(`${reference}: payment ${action === "approve" ? "approved" : "rejected"}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed.");
    } finally {
      setBusy(false);
    }
  }

  async function checkIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await pilotApi.checkIn(eventQrToken.trim(), adminKey) as { fullName?: string; alreadyCheckedIn?: boolean };
      setMessage(result.alreadyCheckedIn ? "Participant was already checked in." : `${result.fullName ?? "Participant"} checked in successfully.`);
      setEventQrToken("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="pilot-page shell">
      <div className="pilot-warning"><strong>PILOT ADMIN</strong><span>Local API-key protection only. This is not production authentication.</span></div>

      <header className="pilot-head compact">
        <div>
          <span className="eyebrow">STATIC QR · MANUAL VERIFICATION</span>
          <h1>Verify the transaction, then unlock attendance.</h1>
          <p>This view proves the full operational loop: registration → payment reference → manual verification → confirmation → check-in.</p>
        </div>
        <div className="pilot-head-links"><Link href="/pilot/register">Participant pilot →</Link><Link href="/">Public draft →</Link></div>
      </header>

      <form className="pilot-admin-key" onSubmit={load}>
        <label><span>PILOT ADMIN KEY</span><input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Enter local pilot key" /></label>
        <button className="button primary" disabled={!adminKey || busy}>{busy ? "Loading…" : "Load pilot data"}</button>
      </form>

      {error && <div className="pilot-error">{error}</div>}
      {message && <div className="pilot-message">{message}</div>}

      {dashboard && (
        <>
          <section className="pilot-metrics">
            <Metric value={dashboard.total} label="Registrations" />
            <Metric value={dashboard.awaitingReview} label="Awaiting review" />
            <Metric value={dashboard.confirmed} label="Confirmed" />
            <Metric value={dashboard.checkedIn} label="Checked in" />
            <Metric value={dashboard.bambooUnits} label="Confirmed bamboo units" />
          </section>

          <section className="pilot-panel">
            <div className="pilot-panel-head"><span>01</span><div><h2>Payment verification queue</h2><p>Approve only after independently checking the receiving wallet or bank account.</p></div></div>
            <div className="pilot-table-wrap">
              <table className="pilot-table">
                <thead><tr><th>Reference</th><th>Participant</th><th>Municipality</th><th>Payment ref</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration.reference}>
                      <td><strong>{registration.reference}</strong></td>
                      <td>{registration.fullName}<small>{registration.organization ?? registration.category}</small></td>
                      <td>{registration.municipality}</td>
                      <td>{registration.payerReference ?? "—"}{registration.reportedAmount != null && <small>Reported ₱{registration.reportedAmount.toFixed(2)}</small>}</td>
                      <td><span className="pilot-status-pill">{registration.paymentStatus}</span></td>
                      <td>
                        {registration.paymentStatus === "FOR_MANUAL_REVIEW" ? (
                          <div className="pilot-row-actions"><button onClick={() => review(registration.reference, "approve")} disabled={busy}>Approve</button><button onClick={() => review(registration.reference, "reject")} disabled={busy}>Reject</button></div>
                        ) : <span className="pilot-muted">No review action</span>}
                      </td>
                    </tr>
                  ))}
                  {registrations.length === 0 && <tr><td colSpan={6}>No pilot registrations yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="pilot-panel pilot-checkin-panel">
            <div className="pilot-panel-head"><span>02</span><div><h2>Event check-in test</h2><p>After approval, copy the event token shown on the participant status screen and paste it here.</p></div></div>
            <form className="pilot-checkin-form" onSubmit={checkIn}>
              <label><span>EVENT QR TOKEN</span><textarea required value={eventQrToken} onChange={(e) => setEventQrToken(e.target.value)} placeholder="Paste the opaque event token" /></label>
              <button className="button primary" disabled={busy || !eventQrToken.trim()}>Confirm check-in</button>
            </form>
          </section>
        </>
      )}
    </main>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return <div><strong>{value}</strong><span>{label}</span></div>;
}
