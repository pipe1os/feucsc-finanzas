# FEUCSC Finance Transparency Portal

[![Live site](https://img.shields.io/badge/Live-feucsc.vercel.app-000000)](https://feucsc.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448c5)](https://cloudinary.com/)
[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](https://github.com/pipe1os/FEUCSC-FINANZAS/actions/workflows/ci.yaml)


[Leer en Español →](./README_es.md)

Financial transparency portal made for FEUCSC (Federación de Estudiantes UCSC).

## Features

### Public portal

- Summary dashboard (budget, spent, remaining)
- Monthly spend trend
- Latest transactions preview
- Full expenses page with category breakdown and receipt links

### Admin panel (restricted)

- Google sign-in (Supabase Auth)
- Dynamic database email allowlist (only approved accounts access)
- Manage expenses and categories
- Secure receipt uploads to Cloudinary
- Receipt preview and deletion

## Tech stack

- Next.js (App Router)
- Supabase (Postgres + Auth)
- Cloudinary (receipt storage)
- SWR (admin data fetching/cache)
- Tailwind CSS
- HeroUI
- Zod (server-side validation)
- Vitest
- GitHub Actions CI
- Lighthouse CI

## Security

Multiple layers protect admin actions and file uploads.

### Authentication & authorization

- Google OAuth via Supabase Auth
- **Row Level Security (RLS):** Database operations restrict to authorized admin emails via Supabase policies.
- Dynamic email allowlist enforces access in Next.js (middleware/Server Actions) and the database.
- Protected admin routes via `middleware.ts`
- Server Actions require authenticated and authorized users

### Secure uploads

Receipt uploads happen server-side.

- Uploads bypass the browser; they go from Next.js to Cloudinary.
- Cloudinary API secrets remain on the server.
- Magic-byte file validation checks file signatures.
- Supported formats: JPEG, PNG, GIF, WebP.
- Max upload size: 5MB.
- Cloudinary restricts files to the `comprobantes/` folder.
- Signed uploads use the Cloudinary SDK.

### Secure deletions

- Receipt deletion requires authentication.
- Cloudinary deletions use server-side signed requests.
- Users can only delete assets inside the `comprobantes/` folder.

## Installation

### Prerequisites

- Node.js (v18+)
- pnpm (v9+)
- A Supabase project
- A Cloudinary account

### Setup

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Create `.env.local` inside the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_PRESUPUESTO_TOTAL=19972000
```

## Usage

### Local development

Start the development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

### Production build

```bash
pnpm build
pnpm start
```

### Routes

**Public:**
- `/`: dashboard
- `/gastos`: all expenses
- `/faq`: dynamic FAQ list
- `/contacto`: contact form and details

**Auth/Admin:**
- `/login`: Google OAuth entry
- `/auth/callback`: OAuth callback
- `/admin`: admin UI

## Quality & Testing

Automated tests and CI workflows ensure reliability, security, and frontend quality.

### Automated tests

Coverage includes authentication helpers, upload validation logic, and image signature/magic-byte validation.

Run tests locally:

```bash
pnpm test
```

## CI/CD

GitHub Actions workflows run on every push to `main` and Pull Requests:

- Code linting (`eslint`)
- Static type checking (`tsc`)
- Automated test execution (`vitest`)
- Production build validation
- Lighthouse CI frontend performance auditing

## Project structure

- `src/app/`: routes (public and admin)
- `src/app/actions/`: Server Actions for DB writes and uploads
- `src/lib/`: Supabase clients, auth helpers, Cloudinary config, utilities, test utilities
- `src/components/`: UI components
- `src/hooks/`: SWR data hooks

## Data model (Supabase)

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

### `categorias`

| Column | Type |
|---|---|
| `id` | uuid |
| `nombre` | unique text |
| `color` | optional hex `#RRGGBB` |
| `creado_el` | timestamp |

When users delete a category, existing expenses reassign to `N/A`.

### `admins`

| Column | Type |
|---|---|
| `id` | uuid |
| `email` | unique text |
| `creado_el` | timestamp |

RLS policies and Next.js middleware check this table to grant access.

## Auth & access control

1. **Database RLS:** Supabase enforces Row Level Security. Only users with emails in the `admins` table can INSERT, UPDATE, or DELETE records.
2. `middleware.ts` blocks `/admin/*` if the session email misses the `admins` allowlist.
3. `src/app/admin/layout.tsx` validates the session server-side before rendering UI.
4. Server Actions require an authenticated session, authorized email, and valid payloads.

`src/lib/auth.ts` queries the admins table using the Service Role Key to avoid RLS circular dependencies during access checks.

## Notes

- Public pages use ISR and revalidate after admin writes.
- `next.config.ts` configures security headers and CSP.
- Cloudinary uploads use signed server-side uploads exclusively.
- The project favors explicit server-side validation alongside strict Postgres RLS.

## License

Proprietary - All rights reserved.
