import type { Metadata } from "next";
import "./globals.css";
import "./responsive.css";
import { SiteHeader } from "@/components/site-header";
import { ProposalNotes } from "@/components/proposal-notes";

export const metadata: Metadata = {
  title: "World Bamboo Day 2026 · Interactive Draft Proposal",
  description: "Interactive proposal for the 2026 World Bamboo Day celebration in Bohol.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader />{children}<ProposalNotes /></body></html>;
}
