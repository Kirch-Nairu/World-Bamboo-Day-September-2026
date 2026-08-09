import Link from "next/link";

const links = [
  ["01 About", "/#about"],
  ["02 Event", "/#event"],
  ["03 Participate", "/#participate"],
  ["04 Register", "/register"],
  ["05 FAQ", "/#faq"],
];

export function SiteHeader() {
  return (
    <>
      <div className="proposal-banner">
        <span>INTERACTIVE DRAFT PROPOSAL</span>
        <span className="proposal-banner-detail">No real registrations or payments are accepted.</span>
      </div>
      <header className="site-header shell">
        <Link href="/" className="brand" aria-label="World Bamboo Day 2026 home">
          <span className="brand-mark">WBD</span>
          <span><strong>World Bamboo Day 2026</strong><small>Bohol · Interactive Proposal</small></span>
        </Link>

        <nav className="main-nav desktop-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
        </nav>
        <Link href="/register" className="header-cta desktop-cta">Preview registration →</Link>

        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            {links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
            <Link href="/proposal">Proposal board</Link>
          </nav>
        </details>
      </header>
    </>
  );
}
