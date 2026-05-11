# FEUCSC Finance Transparency Portal

[![Live site](https://img.shields.io/badge/Live-feucsc.vercel.app-000000)](https://feucsc.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448c5)](https://cloudinary.com/)
[![React Doctor](https://www.react.doctor/share/badge?p=feucsc-finanzas&s=98&e=1&w=1&f=2)](https://www.react.doctor/share?p=feucsc-finanzas&s=98&e=1&w=1&f=2)

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
- Dynamic database email allowlist (only approved accounts can access)
- Manage expenses and categories
- Secure receipt uploads to Cloudinary
- Receipt preview and deletion support

---

## Tech stack

- Next.js (App Router)
- Supabase (Postgres + Auth)
- Cloudinary (receipt storage)
- SWR (admin data fetching/cache)
- Tailwind CSS
- HeroUI

---

## Security highlights

The app uses multiple layers of protection for admin actions and file uploads.

### Authentication & authorization

- Google OAuth via Supabase Auth
- **Row Level Security (RLS):** Database operations are explicitly restricted to authorized admin emails via Supabase policies.
- Dynamic email allowlist enforced both in Next.js (middleware/Server Actions) and the database.
- Protected admin routes via `middleware.ts`
- Server Actions require authenticated + authorized users

### Secure uploads

Receipt uploads are fully server-side.

Security measures include:

- Uploads never go directly from browser → Cloudinary
- Cloudinary API secrets are never exposed to the client
- Magic-byte file validation (not only MIME type)
- File type restrictions (JPEG, PNG, GIF, WebP)
- Max upload size: 5MB
- Cloudinary folder restriction (`comprobantes/`)
- Signed uploads using Cloudinary SDK

### Secure deletions

- Receipt deletion requires authentication
- Only assets inside the configured Cloudinary folder can be deleted
- Cloudinary deletions are server-side signed requests

---

## Project structure

- `src/app/` — routes (public + admin)
- `src/app/actions/` — Server Actions for DB writes + uploads
- `src/lib/` — Supabase clients, auth helpers, Cloudinary config, utilities
- `src/components/` — UI components
- `src/hooks/` — SWR data hooks

---

## Routes

### Public

- `/` — dashboard
- `/gastos` — all expenses

### Auth/Admin

- `/login` — Google OAuth entry
- `/auth/callback` — OAuth callback
- `/admin` — admin UI

---

## Data model (Supabase)

The app expects three tables:

### `gastos`

| Column | Type |
|---|---|
| `id` | uuid |
| `fecha` | `YYYY-MM-DD` |
| `descripcion` | text |
| `categoria` | text |
| `monto` | numeric |
| `comprobante_url` | nullable text |
| `creado_el` | timestamp |

`creado_el` is used for "last sync" indicators and cache invalidation.

---

### `categorias`

| Column | Type |
|---|---|
| `id` | uuid |
| `nombre` | unique text |
| `color` | optional hex `#RRGGBB` |
| `creado_el` | timestamp |

When deleting a category, existing expenses are reassigned to `N/A`.

---

### `admins`

| Column | Type |
|---|---|
| `id` | uuid |
| `email` | unique text |
| `creado_el` | timestamp |

Used for dynamic access control. RLS policies and Next.js middleware check this table to grant or deny access to the admin panel and mutations.

---

## Auth & access control

There are multiple guardrails (by design):

1. **Database RLS:** Supabase enforces Row Level Security. Only users whose `auth.jwt() ->> 'email'` exists in the `admins` table can INSERT, UPDATE, or DELETE records.
2. `middleware.ts` blocks `/admin/*` if there is no session or the email is not found in the `admins` allowlist.
3. `src/app/admin/layout.tsx` validates the session server-side as a secondary check before rendering UI.
4. Server Actions require:
   - authenticated session
   - authorized email (verified against the DB)
   - valid request payloads

The allowlist validation logic lives in:

```txt
src/lib/auth.ts
```

which queries the admins table securely using the Service Role Key to avoid RLS circular dependencies during access checks.

---

## Receipt uploads (Cloudinary)

Uploads are processed entirely server-side using the Cloudinary SDK.

### Upload flow

```txt
Browser → Next.js Server Action → Cloudinary
```

The browser never receives:
- Cloudinary API secret
- Signed upload credentials

### Upload validations

Before uploading, the server validates:

- Authentication
- File size
- MIME type
- Magic bytes / file signatures

Allowed image formats:

- JPEG
- PNG
- GIF
- WebP

Maximum size:

```txt
5 MB
```

Uploaded files are stored inside:

```txt
comprobantes/
```

in Cloudinary.

The resulting `secure_url` is stored in:

```txt
gastos.comprobante_url
```

---

## Receipt deletion

When deleting an expense, the app attempts to delete the corresponding Cloudinary image as best effort.

Deletion protections:

- Auth required
- Server-side signed requests
- Folder-restricted deletion (`comprobantes/` only)

---

## Environment variables

Create:

```txt
.env.local
```

inside the project root.

---

### Required

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

### Optional app config

```env
NEXT_PUBLIC_PRESUPUESTO_TOTAL=19972000
```

---

## Local development

```bash
pnpm install
pnpm dev
```

Then open:

```txt
http://localhost:3000
```

---

## Production build

```bash
pnpm build
pnpm start
```

---

## Notes

- Public pages use ISR and are revalidated after admin writes.
- Security headers and CSP are configured in `next.config.ts`.
- Cloudinary uploads use signed server-side uploads only.
- Upload presets are no longer required.
- The project intentionally favors simple architecture and explicit server-side validation alongside strict Postgres RLS.
