# Static QR backend pilot

This branch adds a **local pilot vertical slice** for World Bamboo Day 2026.

It is deliberately narrower than the proposed production system:

1. participant submits a registration;
2. the .NET API persists it in SQLite;
3. the participant sees a static test QR configured by the pilot operator;
4. the participant enters the transaction/reference number;
5. the registration becomes `PAYMENT_FOR_VERIFICATION` / `FOR_MANUAL_REVIEW`;
6. the pilot administrator independently checks the receiving wallet/bank account;
7. admin approves or rejects the payment reference;
8. approval unlocks the participant's opaque event token;
9. the admin check-in endpoint consumes that event token and prevents duplicate check-in.

## Important boundary

This is **not** an approved DTI/government collection mechanism and should not be treated as one. The pilot admin key is intentionally lightweight and SQLite is used for easy local testing. Production requires approved identity/authentication, institutional payment ownership, PostgreSQL or approved persistence, migration management, hardened audit/security controls, backup/recovery, and the approved payment provider.

## Stack

- .NET 10 / ASP.NET Core Minimal API
- EF Core 10.0.10
- SQLite pilot database
- Next.js frontend on `http://localhost:3000`
- API on `http://localhost:5090`

## Run locally

From the repository root, terminal 1:

```powershell
cd backend\WorldBamboo.Api
dotnet restore
dotnet run
```

The API should report:

```text
Now listening on: http://localhost:5090
```

Health check:

```text
http://localhost:5090/api/health
```

Terminal 2:

```powershell
cd D:\World-Bamboo-Day-September-2026
Copy-Item .env.example .env.local -Force
npm install
npm run dev -- --webpack
```

Open:

```text
http://localhost:3000/pilot/register
http://localhost:3000/pilot/admin
```

Default **local-only** pilot admin key:

```text
local-pilot-only-change-me
```

Override it before any network-exposed pilot:

```powershell
$env:Pilot__AdminKey="use-a-long-random-value"
dotnet run
```

## Using your own static test QR

Do **not** commit a personal/payment QR to the repository.

Recommended local-only path:

1. copy your test QR image to `public/pilot-payment-qr.png`;
2. start the frontend;
3. override the backend config before running the API:

```powershell
$env:Pilot__StaticQrImageUrl="http://localhost:3000/pilot-payment-qr.png"
$env:Pilot__PaymentAccountLabel="TEST ACCOUNT — YOUR LABEL"
$env:Pilot__ExpectedAmount="1.00"
dotnet run
```

`public/pilot-payment-qr.png` should remain local/untracked if it contains personal financial information.

## Pilot data reset

Stop the API and delete:

```text
backend/WorldBamboo.Api/pilot.db
```

Then restart the API. `EnsureCreated` will create a fresh pilot database.

## Production migration path

The intended next architecture is:

```text
Next.js
   ↓
ASP.NET Core API
   ↓
PostgreSQL
   ↓
Approved payment adapter
   ↓
Webhook inbox + reconciliation
```

The static/manual payment implementation should remain a fallback adapter rather than becoming the production source of truth.
