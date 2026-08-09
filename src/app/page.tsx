import Link from "next/link";
import { facts } from "@/lib/proposal-data";

const why = [
  ["Environment", "Position bamboo within land rehabilitation, soil protection and long-term resource stewardship."],
  ["Livelihood", "Connect bamboo with agriculture, craft, enterprise, construction, tourism and local economic activity."],
  ["Community", "Bring government, organizations, growers, enterprises and citizens into one coordinated celebration."],
  ["Future", "Frame the event as a practical step toward a wider green-economy and bamboo-development agenda."],
];

const activities = [
  "Bamboo planting",
  "Enterprise & product showcase",
  "Environmental advocacy",
  "Community participation",
  "Learning & demonstrations",
  "Partner activities",
];

export default function Home() {
  return (
    <main>
      <section className="event-hero">
        <div className="event-hero-backdrop" aria-hidden="true" />
        <div className="event-hero-shade" aria-hidden="true" />
        <div className="event-hero-content shell">
          <div className="event-hero-copy">
            <span className="event-kicker">WORLD BAMBOO DAY 2026 · BOHOL, PHILIPPINES</span>
            <h1>Grow what comes next.</h1>
            <p>
              A mobile-first draft direction for the World Bamboo Day celebration in Loboc, Bohol — connecting public participation, bamboo commitments, registration and event-day attendance.
            </p>
            <div className="event-hero-actions">
              <Link className="button hero-primary" href="/register">Preview registration →</Link>
              <a className="button hero-secondary" href="#event">Explore the event</a>
            </div>
          </div>

          <div className="event-hero-meta" aria-label="Event details">
            <div><span>Date</span><strong>18 September 2026</strong></div>
            <div><span>Host area</span><strong>Loboc, Bohol</strong></div>
            <div><span>Build status</span><strong>Interactive draft</strong></div>
          </div>

          <p className="hero-image-note">Image placeholder · replace with approved event photography.</p>
        </div>
      </section>

      <section id="about" className="section shell compact-section">
        <SectionHead number="01" kicker="World Bamboo Day" title="Bamboo for Bohol. Growth with purpose." />
        <div className="split-copy">
          <p className="section-lead">This proposal treats World Bamboo Day as more than an information page. The intended system connects public participation, registration, the approved payment process, bamboo commitments and event-day attendance.</p>
          <p>Quantitative environmental claims, local bamboo statistics and final program language remain placeholders until organizers provide approved content.</p>
        </div>
        <div className="why-grid">
          {why.map(([title, text], i) => (
            <article key={title}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="event" className="dark-section compact-section">
        <div className="shell">
          <SectionHead number="02" kicker="The Celebration" title="September 18. Loboc, Bohol." inverted />
          <div className="event-grid">
            <div className="event-date"><span>18</span><strong>SEP</strong><small>2026</small></div>
            <div className="event-statement">
              <p>Publicly confirmed details are intentionally separated from assumptions. Exact venue, payment amount, capacity, planting mechanics and the legal payment recipient remain open decisions.</p>
              <Link href="/proposal">Open the proposal decision board →</Link>
            </div>
          </div>
          <div className="activity-list">
            {activities.map((activity, i) => (
              <div key={activity}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{activity}</strong>
                <em>PROPOSED / TBC</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="participate" className="section shell compact-section">
        <SectionHead number="03" kicker="Participation" title="From interest to confirmation." />
        <div className="journey-list">
          {[
            ["Register", "Provide participant and organization information."],
            ["Participate", "Choose the applicable participation or bamboo commitment."],
            ["Pay", "Complete payment through the official approved channel when required."],
            ["Confirm", "Receive a registration reference and event check-in QR."],
            ["Join", "Present the event QR on September 18 and participate in the activity."],
          ].map(([title, text], i) => (
            <div key={title}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section shell registration-preview compact-section">
        <SectionHead number="04" kicker="Registration" title="One clear participant journey." />
        <div className="preview-grid">
          <div>
            <p className="section-lead">The prototype simulates the complete proposed participant path without sending personal information or real money anywhere.</p>
            <ul className="plain-list">
              <li>Participant information</li>
              <li>Participation / bamboo commitment</li>
              <li>Review and consent</li>
              <li>Mock QR Ph / wallet payment</li>
              <li>Confirmation and event QR</li>
            </ul>
            <Link href="/register" className="text-link">Launch the registration prototype →</Link>
          </div>
          <div className="facts-card">
            {facts.map((fact) => (
              <div key={fact.label}>
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
                <em data-status={fact.status}>{fact.status}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section shell compact-section">
        <SectionHead number="05" kicker="Frequently Asked Questions" title="What participants should know." />
        <div className="faq-list">
          {[
            ["Is registration already open?", "No. This build is an interactive draft proposal. It accepts no real registrations."],
            ["How much does participation cost?", "To be confirmed by the organizing committee. The prototype deliberately does not invent a fee."],
            ["How will payment work?", "The preferred production direction is an approved institutional payment facility or authorized gateway with automated verification, with a manual institutional fallback."],
            ["Where exactly is the activity?", "Loboc, Bohol is confirmed. The exact venue or planting site remains to be confirmed."],
            ["Can organizations participate?", "The prototype includes affiliation and organization categories, but bulk delegation mechanics are not yet part of the MVP."],
          ].map(([q, a], i) => (
            <article key={q}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div><h3>{q}</h3><p>{a}</p></div>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell">
          <div><strong>World Bamboo Day 2026</strong><span>Interactive draft proposal · Bohol</span></div>
          <p>No official partnership, price, payment arrangement, capacity or institutional infrastructure is implied unless marked confirmed.</p>
        </div>
      </footer>
    </main>
  );
}

function SectionHead({ number, kicker, title, inverted = false }: { number: string; kicker: string; title: string; inverted?: boolean }) {
  return <div className={`section-head ${inverted ? "inverted" : ""}`}><div><span>{number}</span><small>{kicker}</small></div><h2>{title}</h2></div>;
}
