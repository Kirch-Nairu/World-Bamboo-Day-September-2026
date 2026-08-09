"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { costScenarios, facts, routeNotes, stackPlan } from "@/lib/proposal-data";

type Tab = "Overview" | "Decisions" | "Implementation" | "Stack" | "Costs" | "Risks" | "Meeting";

const tabs: Tab[] = ["Overview", "Decisions", "Implementation", "Stack", "Costs", "Risks", "Meeting"];

export function ProposalNotes() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("Overview");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [paymentOwner, setPaymentOwner] = useState("Unknown");
  const [paymentMeaning, setPaymentMeaning] = useState("Unknown");

  useEffect(() => {
    setMeetingNotes(localStorage.getItem("wbd-proposal-meeting-notes") ?? "");
    setPaymentOwner(localStorage.getItem("wbd-payment-owner") ?? "Unknown");
    setPaymentMeaning(localStorage.getItem("wbd-payment-meaning") ?? "Unknown");
  }, []);

  const note = useMemo(() => {
    const key = Object.keys(routeNotes).find((candidate) => pathname === candidate || (candidate !== "/" && pathname.startsWith(candidate)));
    return routeNotes[key ?? "/"];
  }, [pathname]);

  function saveMeetingNotes(value: string) {
    setMeetingNotes(value);
    localStorage.setItem("wbd-proposal-meeting-notes", value);
  }

  function selectDecision(key: "owner" | "meaning", value: string) {
    if (key === "owner") {
      setPaymentOwner(value);
      localStorage.setItem("wbd-payment-owner", value);
    } else {
      setPaymentMeaning(value);
      localStorage.setItem("wbd-payment-meaning", value);
    }
  }

  return (
    <>
      <button className="proposal-toggle" onClick={() => setOpen(true)} aria-expanded={open}>
        <span className="proposal-dot" /> Proposal notes
      </button>
      {open && <button className="drawer-scrim" aria-label="Close proposal notes" onClick={() => setOpen(false)} />}
      <aside className={`proposal-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="proposal-drawer-head">
          <div>
            <span className="eyebrow">DRAFT PROPOSAL NOTES</span>
            <h2>{note.title}</h2>
          </div>
          <button className="text-button" onClick={() => setOpen(false)}>Close ×</button>
        </div>
        <div className="proposal-tabs" role="tablist" aria-label="Proposal note sections">
          {tabs.map((item, index) => (
            <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
              <span>{String(index + 1).padStart(2, "0")}</span>{item}
            </button>
          ))}
        </div>
        <div className="proposal-content">
          {tab === "Overview" && (
            <section>
              <NoteLabel>What this screen represents</NoteLabel>
              <p className="note-lead">{note.summary}</p>
              <div className="note-rule" />
              <NoteLabel>Current assumption status</NoteLabel>
              <div className="fact-list compact">
                {facts.map((fact) => (
                  <div className="fact-row" key={fact.label}>
                    <span>{fact.label}</span><strong>{fact.value}</strong><em data-status={fact.status}>{fact.status}</em>
                  </div>
                ))}
              </div>
            </section>
          )}
          {tab === "Decisions" && (
            <section>
              <DecisionBlock title="Who receives participant payments?" selected={paymentOwner} values={["DTI", "Provincial Government", "Loboc LGU", "Event Partner", "Other", "Unknown"]} onSelect={(v) => selectDecision("owner", v)} />
              <DecisionBlock title="What does the payment represent?" selected={paymentMeaning} values={["Registration fee", "Bamboo / seedling purchase", "Bamboo sponsorship", "Participation package", "Donation / contribution", "Unknown"]} onSelect={(v) => selectDecision("meaning", v)} />
              <p className="microcopy">Selections are saved only in this browser as meeting scratch decisions. They are not treated as approved requirements.</p>
            </section>
          )}
          {tab === "Implementation" && (
            <section>
              <NoteLabel>Production direction</NoteLabel>
              <p className="note-lead">{note.implementation}</p>
              <div className="architecture-mini">
                <div><b>Participant</b><span>Registration · payment · confirmation</span></div>
                <span>↓</span>
                <div><b>World Bamboo Day Portal</b><span>Public app · admin operations</span></div>
                <span>↓</span>
                <div><b>Production services</b><span>API · PostgreSQL · approved payment facility</span></div>
              </div>
            </section>
          )}
          {tab === "Stack" && (
            <section>
              <NoteLabel>Proposed technical direction</NoteLabel>
              <div className="stack-list">
                {stackPlan.map(([name, value], i) => <div key={name}><span>{String(i + 1).padStart(2, "0")}</span><strong>{name}</strong><p>{value}</p></div>)}
              </div>
            </section>
          )}
          {tab === "Costs" && (
            <section>
              <NoteLabel>Projected cost considerations</NoteLabel>
              <p>Planning estimates only. Final cost depends on approved scope, institutional resources, payment arrangement and support expectations.</p>
              <div className="cost-list">
                {costScenarios.map((item, i) => <div key={item.title}><span>{String(i + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div><b>{item.range}</b></div>)}
              </div>
              <div className="working-envelope"><span>CURRENT WORKING ENVELOPE</span><strong>₱100,000–₱115,000</strong><p>Complete automated MVP, subject to discovery. Existing institutional resources may reduce external operating cost.</p></div>
            </section>
          )}
          {tab === "Risks" && (
            <section className="risk-list">
              <Risk severity="HIGH" title="Fixed September deadline">Requirements and institutional dependencies must be finalized early enough to preserve testing time.</Risk>
              <Risk severity="HIGH" title="Payment ownership unresolved">Automated payment cannot be finalized until the legal recipient and approved collection facility are known.</Risk>
              <Risk severity="MEDIUM" title="Hosting approval">Existing DTI/DICT resources should be investigated before external infrastructure is purchased.</Risk>
              <Risk severity="MEDIUM" title="Venue connectivity">Event-day connectivity should be tested before deciding whether offline functionality is necessary.</Risk>
              <Risk severity="HIGH" title="Scope expansion">Late modules reduce the time available for payment, security and event-readiness testing.</Risk>
            </section>
          )}
          {tab === "Meeting" && (
            <section>
              <NoteLabel>Live meeting scratchpad</NoteLabel>
              <textarea className="meeting-textarea" value={meetingNotes} onChange={(e) => saveMeetingNotes(e.target.value)} placeholder="Capture decisions, questions and action items here during the meeting…" />
              <div className="meeting-actions"><button onClick={() => navigator.clipboard?.writeText(meetingNotes)}>Copy notes</button><button onClick={() => saveMeetingNotes("")}>Reset</button><Link href="/proposal">Open decision board →</Link></div>
              <p className="microcopy">Saved locally on this device. No meeting notes are transmitted to a server in prototype mode.</p>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}

function NoteLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="note-label">{children}</h3>;
}

function DecisionBlock({ title, selected, values, onSelect }: { title: string; selected: string; values: string[]; onSelect: (value: string) => void }) {
  return <div className="decision-block"><span className="eyebrow">OPEN DECISION</span><h3>{title}</h3><div className="decision-options">{values.map((value) => <button key={value} className={selected === value ? "selected" : ""} onClick={() => onSelect(value)}><span>{selected === value ? "●" : "○"}</span>{value}</button>)}</div><small>Discussion selection: {selected}</small></div>;
}

function Risk({ severity, title, children }: { severity: "HIGH" | "MEDIUM"; title: string; children: React.ReactNode }) {
  return <div className="risk"><div><span data-severity={severity}>{severity}</span><strong>{title}</strong></div><p>{children}</p></div>;
}
