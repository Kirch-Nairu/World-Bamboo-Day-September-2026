"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const steps = ["Participant", "Participation", "Details", "Review", "Payment"];
type PaymentMethod = "qrph" | "gcash" | "maya" | "manual";
type PaymentState = "idle" | "verifying" | "success" | "failed" | "pending";
type FormState = { name:string; email:string; mobile:string; municipality:string; organization:string; category:string; participation:string; bamboo:number; notes:string };
const initial: FormState = { name:"", email:"", mobile:"", municipality:"", organization:"", category:"Individual", participation:"Celebration participant", bamboo:1, notes:"" };
const draftKey = "wbd26-registration-draft-v1";

export default function RegisterPage() {
  const [step,setStep] = useState(0);
  const [form,setForm] = useState<FormState>(initial);
  const [paymentMethod,setPaymentMethod] = useState<PaymentMethod>("qrph");
  const [paymentState,setPaymentState] = useState<PaymentState>("idle");
  const [hydrated,setHydrated] = useState(false);
  const reference = "WBD26-DEMO-00421";

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(draftKey);
      if (saved) setForm({ ...initial, ...JSON.parse(saved) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(draftKey, JSON.stringify(form)); } catch {}
  }, [form, hydrated]);

  function update<K extends keyof FormState>(key:K,value:FormState[K]) { setForm((current)=>({ ...current,[key]:value })); }
  function next(event?:FormEvent) { event?.preventDefault(); setStep((current)=>Math.min(current+1,steps.length-1)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function back() { setStep((current)=>Math.max(current-1,0)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function resetDemo() {
    setStep(0); setForm(initial); setPaymentState("idle"); setPaymentMethod("qrph");
    try { window.localStorage.removeItem(draftKey); } catch {}
  }
  const completed = useMemo(()=>paymentState==="success",[paymentState]);
  const progress = ((step + 1) / steps.length) * 100;

  if (completed) return (
    <main className="shell registration-shell">
      <div className="registration-success">
        <span className="eyebrow">REGISTRATION CONFIRMED · DEMO</span>
        <h1>You&apos;re part of World Bamboo Day 2026.</h1>
        <p>This is a simulated confirmation. No personal data or payment was transmitted.</p>
        <div className="confirmation-grid">
          <div><span>REFERENCE</span><strong>{reference}</strong></div>
          <div><span>EVENT</span><strong>18 September 2026 · Loboc, Bohol</strong></div>
        </div>
        <DemoQr label="EVENT CHECK-IN QR" />
        <p className="microcopy center">This demo QR illustrates event admission. It is separate from any future payment QR.</p>

        <div className="confirmation-next">
          {[
            ["01", "Keep your confirmation", "In production, participants should retain their registration reference and event QR."],
            ["02", "Watch for event instructions", "Final venue, arrival details and approved program instructions will come from the organizers."],
            ["03", "Present the event QR", "Staff can scan the event QR at the registration desk and record actual attendance."],
          ].map(([n,title,text]) => <div className="next-step" key={n}><span>{n}</span><div><strong>{title}</strong><p>{text}</p></div></div>)}
        </div>

        <div className="hero-actions center"><Link href="/" className="button quiet">Return home</Link><button className="button primary" onClick={resetDemo}>Restart demo</button></div>
      </div>
    </main>
  );

  return (
    <main className="shell registration-shell">
      <div className="registration-intro">
        <span className="eyebrow">04 — REGISTRATION PROTOTYPE</span>
        <h1>One clear registration journey.</h1>
        <p>No real registration or payment occurs in this prototype. Fields and participation mechanics remain subject to organizer approval.</p>
      </div>

      <div className="registration-context" aria-label="Registration context">
        <div><span>EVENT</span><strong>World Bamboo Day 2026</strong></div>
        <div><span>DATE</span><strong>18 September</strong></div>
        <div><span>LOCATION</span><strong>Loboc, Bohol</strong></div>
        <div><span>DRAFT</span><strong className="autosave-note">Saved on this device</strong></div>
      </div>

      <div className="step-progress" aria-hidden="true">
        <div className="step-progress-top"><strong>{steps[step]}</strong><span>Step {step + 1} of {steps.length}</span></div>
        <div className="step-progress-track"><div className="step-progress-fill" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="stepper">{steps.map((label,i)=><div key={label} className={i===step?"current":i<step?"done":""}><span>{String(i+1).padStart(2,"0")}</span><strong>{label}</strong></div>)}</div>

      <div className="wizard-layout">
        <div className="wizard-panel">
          {step===0 && (
            <form onSubmit={next}>
              <WizardHead number="01" title="Participant" text="Tell us who will participate using only the information the event needs." />
              <div className="form-grid">
                <Field label="Full name *"><input required autoComplete="name" value={form.name} onChange={(e)=>update("name",e.target.value)} placeholder="Juan Dela Cruz" /></Field>
                <Field label="Email address *"><input required type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e)=>update("email",e.target.value)} placeholder="juan@example.com" /></Field>
                <Field label="Mobile number *"><input required inputMode="tel" autoComplete="tel" value={form.mobile} onChange={(e)=>update("mobile",e.target.value)} placeholder="09XX XXX XXXX" /></Field>
                <Field label="Municipality / City *"><input required autoComplete="address-level2" value={form.municipality} onChange={(e)=>update("municipality",e.target.value)} placeholder="Loboc, Bohol" /></Field>
                <Field label="Organization / Affiliation"><input value={form.organization} onChange={(e)=>update("organization",e.target.value)} placeholder="Optional" /></Field>
                <Field label="Participant category"><select value={form.category} onChange={(e)=>update("category",e.target.value)}>{["Individual","Student","Government","Private Sector","NGO / Civic Organization","Bamboo Grower","Bamboo Enterprise","Volunteer","Other"].map((x)=><option key={x}>{x}</option>)}</select></Field>
              </div>
              <WizardActions nextLabel="Continue to participation →" />
            </form>
          )}

          {step===1 && (
            <div>
              <WizardHead number="02" title="Participation" text="Choose the proposed way you will take part. Final categories remain configurable." />
              <div className="choice-list">{[
                ["Celebration participant","Register as an individual participant in the World Bamboo Day activities."],
                ["Bamboo commitment","Indicate one or more bamboo planting units to support or participate with."],
                ["Organization / delegation","Register participation under an organization or group. Bulk registration is not yet in MVP."],
              ].map(([title,text])=><button type="button" key={title} className={form.participation===title?"selected":""} onClick={()=>update("participation",title)}><span>{form.participation===title?"●":"○"}</span><div><strong>{title}</strong><p>{text}</p></div><em>PROPOSED</em></button>)}</div>
              {form.participation==="Bamboo commitment" && <div className="quantity-row"><div><span className="eyebrow">BAMBOO UNITS</span><strong>Proposed quantity</strong></div><div><button type="button" onClick={()=>update("bamboo",Math.max(1,form.bamboo-1))}>−</button><b>{form.bamboo}</b><button type="button" onClick={()=>update("bamboo",form.bamboo+1)}>+</button></div></div>}
              <WizardActions onBack={back} onNext={()=>next()} nextLabel="Continue to details →" />
            </div>
          )}

          {step===2 && (
            <div>
              <WizardHead number="03" title="Event details" text="Operational fields should only be enabled when the organizers confirm that they are necessary." />
              <div className="form-grid">
                <Field label="Preferred activity / batch"><select disabled><option>To be confirmed</option></select></Field>
                <Field label="Transportation requirement"><select disabled><option>To be confirmed</option></select></Field>
                <Field label="Accessibility / operational note"><textarea value={form.notes} onChange={(e)=>update("notes",e.target.value)} placeholder="Optional — only if relevant to event operations" /></Field>
              </div>
              <div className="proposal-callout"><span>PRIVACY-BY-DESIGN NOTE</span><p>These are proposal placeholders. Organizers should identify which information is genuinely necessary before production.</p></div>
              <WizardActions onBack={back} onNext={()=>next()} nextLabel="Review registration →" />
            </div>
          )}

          {step===3 && (
            <div>
              <WizardHead number="04" title="Review" text="Confirm the participant record before initiating the approved payment path." />
              <div className="review-sheet">
                <ReviewRow label="Participant" value={form.name||"Demo participant"} />
                <ReviewRow label="Mobile" value={form.mobile||"09XX XXX XXXX"} />
                <ReviewRow label="Municipality" value={form.municipality||"Loboc, Bohol"} />
                <ReviewRow label="Affiliation" value={form.organization||"—"} />
                <ReviewRow label="Category" value={form.category} />
                <ReviewRow label="Participation" value={form.participation} />
                <ReviewRow label="Bamboo commitment" value={form.participation==="Bamboo commitment"?`${form.bamboo} unit(s)`:"Not selected"} />
                <ReviewRow label="Amount due" value="TO BE CONFIRMED" status="OPEN" />
              </div>
              <div className="check-list"><label><input type="checkbox" defaultChecked /> Information above is correct for this demo.</label><label><input type="checkbox" defaultChecked /> I acknowledge the proposed participation guidelines.</label><label><input type="checkbox" defaultChecked /> I have reviewed the prototype privacy note.</label></div>
              <WizardActions onBack={back} onNext={()=>next()} nextLabel="Continue to payment →" />
            </div>
          )}

          {step===4 && (
            <div>
              <WizardHead number="05" title="Payment preview" text="Compare the proposed approved-payment experiences without transmitting real money." />
              <div className="payment-summary"><div><span>REGISTRATION</span><strong>{reference}</strong></div><div><span>AMOUNT DUE</span><strong>TO BE CONFIRMED</strong></div><div><span>STATUS</span><strong>{paymentState==="idle"?"AWAITING PAYMENT":paymentState.toUpperCase()}</strong></div></div>

              <div className="payment-methods">
                <PaymentButton method="qrph" selected={paymentMethod} setMethod={setPaymentMethod} title="QR PH" text="Preferred automated flow" />
                <PaymentButton method="gcash" selected={paymentMethod} setMethod={setPaymentMethod} title="GCASH" text="Hosted checkout / redirect" />
                <PaymentButton method="maya" selected={paymentMethod} setMethod={setPaymentMethod} title="MAYA" text="Hosted checkout / redirect" />
                <PaymentButton method="manual" selected={paymentMethod} setMethod={setPaymentMethod} title="MANUAL" text="Institutional fallback" />
              </div>

              <div className="payment-experience">
                {paymentMethod === "qrph" && <div className="qr-payment"><DemoQr label="DEMO / NOT PAYABLE" /><div><span className="eyebrow">QR PH PAYMENT PREVIEW</span><h3>Scan in production. Not payable here.</h3><p>The production provider would generate a transaction-specific QR or hosted payment session. The server would verify the provider result before confirming registration.</p></div></div>}
                {(paymentMethod === "gcash" || paymentMethod === "maya") && <div className="wallet-preview"><div><span className="eyebrow">{paymentMethod.toUpperCase()} CHECKOUT PREVIEW</span><h3>Leave the portal, authorize securely, then return.</h3><p>The participant would be sent to the approved provider experience. The portal would wait for verified server-side status rather than trusting the browser redirect alone.</p></div><button type="button" className="button quiet" onClick={()=>setPaymentState("pending")}>Simulate redirect →</button></div>}
                {paymentMethod === "manual" && <div className="manual-preview"><div><span className="eyebrow">MANUAL INSTITUTIONAL FALLBACK</span><h3>Use only if automated payment cannot be approved in time.</h3><p>The official receiving account and verification process must belong to the authorized organizer or merchant. Uploaded proof is supporting evidence, not final financial truth.</p></div><div className="manual-fields"><div className="manual-field"><span>Account name</span><strong>TO BE CONFIRMED</strong></div><div className="manual-field"><span>Bank / wallet</span><strong>TO BE CONFIRMED</strong></div><div className="manual-field"><span>Reference</span><strong>Participant enters reference</strong></div></div></div>}
              </div>

              <PaymentStatus state={paymentState} />

              <div className="demo-controls">
                <button type="button" onClick={()=>{setPaymentState("verifying");setTimeout(()=>setPaymentState("success"),900);}}>Simulate success</button>
                <button type="button" onClick={()=>setPaymentState("pending")}>Simulate pending</button>
                <button type="button" onClick={()=>setPaymentState("failed")}>Simulate failed</button>
                <button type="button" onClick={()=>setPaymentState("idle")}>Reset state</button>
              </div>
              <WizardActions onBack={back} />
            </div>
          )}
        </div>

        <aside className="registration-sidecar" aria-label="Registration summary">
          <h3>Registration snapshot</h3>
          <p>Live browser-local summary for this prototype. Nothing is sent to a server.</p>
          <SidecarRow label="Reference" value={reference} />
          <SidecarRow label="Participant" value={form.name || "Not entered yet"} />
          <SidecarRow label="Participation" value={form.participation} />
          <SidecarRow label="Bamboo" value={form.participation === "Bamboo commitment" ? `${form.bamboo} unit(s)` : "—"} />
          <SidecarRow label="Payment" value={paymentState === "idle" ? "Not initiated" : paymentState.toUpperCase()} />
          <SidecarRow label="Amount" value="TBC" />
        </aside>
      </div>
    </main>
  );
}

function WizardHead({number,title,text}:{number:string;title:string;text:string}) { return <div className="wizard-head"><span>{number}</span><div><h2>{title}</h2><p>{text}</p></div></div>; }
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="field"><span>{label}</span>{children}</label>; }
function WizardActions({onBack,onNext,nextLabel}:{onBack?:()=>void;onNext?:()=>void;nextLabel?:string}) { return <div className="wizard-actions">{onBack?<button type="button" className="button quiet" onClick={onBack}>← Back</button>:<span />}{nextLabel&&<button type={onNext?"button":"submit"} className="button primary" onClick={onNext}>{nextLabel}</button>}</div>; }
function ReviewRow({label,value,status}:{label:string;value:string;status?:string}) { return <div><span>{label}</span><strong>{value}</strong>{status&&<em data-status={status}>{status}</em>}</div>; }
function SidecarRow({label,value}:{label:string;value:string}) { return <div className="sidecar-row"><span>{label}</span><strong>{value}</strong></div>; }
function DemoQr({label}:{label:string}) { return <div className="demo-qr" aria-label={label}><div className="qr-pattern" /><span>{label}</span></div>; }
function PaymentButton({method,selected,setMethod,title,text}:{method:PaymentMethod;selected:PaymentMethod;setMethod:(m:PaymentMethod)=>void;title:string;text:string}) { return <button type="button" className={selected===method?"selected":""} onClick={()=>{setMethod(method);setPaymentState("idle");}}><strong>{title}</strong><span>{text}</span></button>; }
function PaymentStatus({state}:{state:PaymentState}) {
  const copy: Record<PaymentState,[string,string]> = {
    idle:["Awaiting payment", "No payment has been initiated in the demo."],
    verifying:["Verifying provider result", "Production would verify the payment server-side before changing the registration state."],
    pending:["Payment pending", "The registration remains pending while the provider or finance workflow is unresolved."],
    failed:["Payment not confirmed", "The participant can retry or choose another approved payment path without creating a duplicate registration."],
    success:["Payment confirmed", "The production system would issue the event QR only after authoritative payment confirmation."],
  };
  return <div className="payment-state-banner"><span>PAYMENT STATE</span><strong>{copy[state][0]}</strong><p>{copy[state][1]}</p></div>;
}
