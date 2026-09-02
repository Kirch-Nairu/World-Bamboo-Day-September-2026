# Draft Architecture

## Purpose

This repository currently represents an interactive proposal and production-frontend candidate for World Bamboo Day 2026 in Bohol.

The proposal build must never imply that payment ownership, pricing, exact venue, capacity, partner logos, government hosting, or institutional integrations are confirmed unless they are explicitly marked `CONFIRMED`.

## Prototype stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Browser-local mock state
- Vercel-compatible frontend deployment

## Production direction

Preferred production direction after discovery:

1. Next.js frontend retained from the approved prototype.
2. ASP.NET Core modular-monolith API.
3. PostgreSQL transactional database.
4. Background worker for payment/notification/reconciliation jobs.
5. DTI/DICT or other approved institutional hosting where available.
6. Authorized payment facility owned by the legal payment recipient.
7. QR-based event admission with audited check-in.

## Prototype boundaries

- No real registration persistence.
- No real participant data leaves the browser.
- No payable QR code.
- No payment provider credentials.
- No production authentication.
- No official organizer or partner logos without approval.
