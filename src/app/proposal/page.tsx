import { costScenarios, facts, stackPlan } from "@/lib/proposal-data";

const decisions = [
  ["Governance", "Which organization is commissioning and paying for the system?", "OPEN"],
  ["Payment", "Which organization legally receives participant payments?", "BLOCKED"],
  ["Payment", "What exactly does the participant payment represent?", "OPEN"],
  ["Event", "What is the exact venue / planting site in Loboc?", "OPEN"],
  ["Event", "What is the physical participant / planting capacity?", "OPEN"],
  ["Infrastructure", "Can DTI/LGU provide domain, hosting, email or payment infrastructure?", "OPEN"],
  ["Budget", "What is the approved / expected project budget range?", "OPEN"],
  ["Scope", "Is this one-event only or intended for reuse?", "OPEN"],
];

export default function ProposalPage() {
  return <main className="shell proposal-page"><div className="proposal-page-head"><span className="eyebrow">INTERACTIVE PROPOSAL · DECISION BOARD</span><h1>What is known. What is proposed. What still decides the architecture.</h1><p>Use this page during discovery. Nothing marked OPEN or BLOCKED should be presented later as an approved requirement.</p></div><section className="proposal-section"><div className="proposal-section-title"><span>01</span><h2>Current facts and assumptions</h2></div><div className="fact-list">{facts.map((fact) => <div className="fact-row" key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong><em data-status={fact.status}>{fact.status}</em></div>)}</div></section><section className="proposal-section"><div className="proposal-section-title"><span>02</span><h2>Open decisions</h2></div><div className="decision-board">{decisions.map(([area,q,status],i) => <article key={q}><span>{String(i+1).padStart(2,"0")}</span><small>{area}</small><h3>{q}</h3><em data-status={status}>{status}</em></article>)}</div></section><section className="proposal-section"><div className="proposal-section-title"><span>03</span><h2>Projected cost scenarios</h2></div><div className="cost-list page-costs">{costScenarios.map((item,i) => <div key={item.title}><span>{String(i+1).padStart(2,"0")}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div><b>{item.range}</b></div>)}</div><div className="working-envelope"><span>CURRENT WORKING ENVELOPE</span><strong>₱100,000–₱115,000</strong><p>Complete automated MVP, subject to discovery and institutional resource availability.</p></div></section><section className="proposal-section"><div className="proposal-section-title"><span>04</span><h2>Stack direction</h2></div><div className="stack-list page-stack">{stackPlan.map(([name,value],i) => <div key={name}><span>{String(i+1).padStart(2,"0")}</span><strong>{name}</strong><p>{value}</p></div>)}</div></section></main>;
}
