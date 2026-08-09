import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      <div className="proposal-banner">
        <span>INTERACTIVE DRAFT PROPOSAL</span>
        <span>No real registrations or payments are accepted.</span>
      </div>
      <header className="site-header shell">
        <Link href="/" className="brand" aria-label="World Bamboo Day 2026 home">
          <span className="brand-mark">WBD</span>
          <span><strong>World Bamboo Day 2026</strong><small>Bohol · Interactive Proposal</small></span>
        </Link>
        <nav className="main-nav" aria-label="Primary navigation">
          <Link href="/#about">01 About</Link><Link href="/#event">02 Event</Link><Link href="/#participate">03 Participate</Link><Link href="/register">04 Register</Link><Link href="/#faq">05 FAQ</Link>
        </nav>
        <Link href="/register" className="header-cta">Preview registration →</Link>
      </header>
    </>
  );
}
