# FEUCSC Finance Transparency Portal

[![Live site](https://img.shields.io/badge/Live-feucsc.vercel.app-000000)](https://feucsc.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448c5)](https://cloudinary.com/)

[Leer en Español →](./README_es.md)

This is a focused transparency portal for the **FEUCSC** (Federación de Estudiantes UCSC).

The goal is that students should be able to quickly understand where the federation budget goes and verify expenses by opening the supporting receipts.

---

## What you get

### Public portal

- Summary dashboard (budget, spent, remaining)
- Monthly spend trend
- Latest transactions preview
- Full expenses page with category breakdown and receipt links

### Admin panel (restricted)

- Google sign-in (Supabase Auth)
- Email allowlist (only approved accounts can access)
- Manage expenses and categories
- Upload receipt images to Cloudinary and attach them to expenses

---

## Tech stack

- Next.js (App Router)
- Supabase (Postgres + Auth)
- Cloudinary (receipt storage)
- SWR (admin data fetching/cache)
- Tailwind + HeroUI

---

## Project structure

- `src/app/` — routes (public + admin)
- `src/app/actions/` — Server Actions for DB writes + uploads
- `src/lib/` — Supabase clients, auth helpers, small utilities
- `src/components/` — UI components

---

## Routes

Public:

- `/` — dashboard
- `/gastos` — all expenses

Auth/Admin:

- `/login` — Google OAuth entry
- `/auth/callback` — OAuth callback
- `/admin` — admin UI

---

## Data model (Supabase)

The app expects two tables:

### `gastos`

- `id` (uuid)
- `fecha` (`YYYY-MM-DD`)
- `descripcion`
- `categoria`
- `monto`
- `comprobante_url` (nullable)
- `creado_el` (timestamp; used for “last sync”)

### `categorias`

- `id` (uuid)
- `nombre` (unique)
- `color` (optional hex `#RRGGBB`)
- `creado_el`

When you delete a category, existing expenses are reassigned to `N/A`.

---

## Auth & access control

There are multiple guardrails (by design):

1. `middleware.ts` blocks `/admin/*` if there is no session or the email is not allowed.
2. `src/app/admin/layout.tsx` checks the session client-side as a second line of defense.
3. Server Actions require an authenticated session **and** an allowlisted email before mutating anything.

The allowlist lives in `src/lib/auth.ts` (`AUTHORIZED_EMAILS`).

---

## Receipt uploads (Cloudinary)

Uploads are done server-side.

- Only images are accepted (validated using magic bytes + MIME type)
- Max size: 5MB
- The returned Cloudinary `secure_url` is stored in `gastos.comprobante_url`

On expense deletion, the app attempts to delete the Cloudinary image as best effort.

---

## Environment variables

Create `.env.local` in `feucsc-finanzas/`.

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

Optional (depending on your Cloudinary setup):

- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `CLOUDINARY_API_KEY` (server-only; required for Cloudinary delete)
- `CLOUDINARY_API_SECRET` (server-only; required for Cloudinary delete)

App config:

- `NEXT_PUBLIC_PRESUPUESTO_TOTAL` (defaults to `19972000`)

---

## Run locally

```/dev/null/terminal
pnpm install
pnpm dev
```

Then open http://localhost:3000.

---

## Build

```/dev/null/terminal
pnpm build
pnpm start
```

---

## Notes

- Public pages use ISR (revalidated periodically) and are also revalidated after admin writes.
- Security headers and CSP are configured in `next.config.ts`.
