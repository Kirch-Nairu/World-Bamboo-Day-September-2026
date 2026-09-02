# World Bamboo Day September 2026

Interactive draft proposal and production-frontend candidate for the 2026 World Bamboo Day celebration in Bohol.

> **Status:** Prototype / discovery stage. No real registrations or payments are accepted by this build.

## What is implemented

- Editorial World Bamboo Day landing page with image placeholders
- Explicit `CONFIRMED`, `PROPOSED`, `OPEN`, and `BLOCKED` requirement states
- Five-step registration prototype
- Bamboo-participation / commitment selection
- Non-payable QR Ph-style payment simulation
- Simulated pending, failed, verification, and successful payment states
- Demo event check-in QR
- Organizer/admin operations preview
- Bamboo-commitment and payment-exception views
- Meeting-facing proposal decision board
- Context-aware **Proposal Notes** drawer
- Browser-local meeting notes and payment-decision scratch selections
- Projected cost scenarios, stack direction, risks, and open decisions

## Routes

- `/` — public proposal experience
- `/register` — participant registration and payment simulation
- `/admin` — organizer operations demo
- `/proposal` — discovery / decision board

## Prototype stack

- Next.js 16.2.11
- React 19.2.7
- TypeScript
- Tailwind CSS 4.3
- Browser-local mock state
- Vercel-compatible frontend deployment

## Local development

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` when proposal-mode flags are wired into runtime behavior.

## Production direction

The approved prototype is intended to evolve toward a Next.js frontend backed by an ASP.NET Core modular-monolith API, PostgreSQL, audited administrative access, background processing, and an approved institutional payment facility. Hosting remains vendor-neutral until DTI/LGU/organizer infrastructure is confirmed.

See `docs/ARCHITECTURE.md` and `docs/OPEN-DECISIONS.md`.

## Important boundary

This repository must not be presented as an official registration portal while it is in proposal mode. Prices, payment ownership, exact venue, capacity, organizer/partner identity, institutional infrastructure, and final program mechanics remain unconfirmed unless explicitly marked otherwise.
