export type ProposalStatus = "CONFIRMED" | "PROPOSED" | "OPEN" | "BLOCKED" | "OUT OF SCOPE";

export const facts = [
  { label: "Event date", value: "September 18, 2026", status: "CONFIRMED" as ProposalStatus },
  { label: "Host municipality", value: "Loboc, Bohol", status: "CONFIRMED" as ProposalStatus },
  { label: "Exact event / planting site", value: "To be confirmed", status: "OPEN" as ProposalStatus },
  { label: "Payment recipient", value: "To be confirmed", status: "BLOCKED" as ProposalStatus },
  { label: "Payment amount / model", value: "To be confirmed", status: "OPEN" as ProposalStatus },
  { label: "Dynamic QR Ph", value: "Preferred automated flow", status: "PROPOSED" as ProposalStatus },
];

export const costScenarios = [
  { title: "Registration + QR attendance", range: "₱45,000–₱60,000", detail: "Public registration, administration, event QR, check-in and core reporting." },
  { title: "Manual payment workflow", range: "₱60,000–₱80,000", detail: "Adds institutional payment instructions, finance verification and audit history." },
  { title: "Automated payment MVP", range: "₱80,000–₱105,000", detail: "Adds one approved payment integration, automated verification, reconciliation and exceptions." },
  { title: "Temporary external infrastructure", range: "₱5,000–₱12,000", detail: "Temporary hosting, database/backups, application email and monitoring where required." },
];

export const stackPlan = [
  ["Prototype", "Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Vercel Preview"],
  ["Production UI", "Next.js frontend retained from the approved prototype"],
  ["Production API", "ASP.NET Core modular monolith with background worker"],
  ["Database", "PostgreSQL transactional store"],
  ["Deployment", "Docker · approved DTI/DICT environment or approved external VPS"],
  ["Payment", "DTI/institutional facility first; authorized gateway fallback"],
  ["Security", "RBAC · audit trail · HTTPS · rate controls · backup/restore"],
];

export const routeNotes: Record<string, { title: string; summary: string; implementation: string }> = {
  "/": { title: "Public proposal experience", summary: "This page demonstrates the proposed public-facing identity, event narrative and route into registration.", implementation: "Replace placeholders with organizer-approved photos, event copy, official logos and the final program after discovery." },
  "/register": { title: "Registration journey", summary: "This wizard demonstrates participant capture, participation selection, review, mock payment and confirmation.", implementation: "Production will submit validated records to the API, reserve capacity, create an order and initiate the approved payment flow." },
  "/admin": { title: "Organizer operations", summary: "This screen demonstrates how staff could monitor registrations, payments, bamboo commitments and event attendance.", implementation: "Production will require authenticated role-based access, immutable financial history and audited administrative actions." },
  "/proposal": { title: "Decision board", summary: "Meeting-facing view of assumptions, scope options, costs, risks and open decisions.", implementation: "Temporary proposal tooling. This route can be removed or disabled after requirements are formally approved." },
};
