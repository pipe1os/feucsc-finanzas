# Portal de Transparencia Financiera FEUCSC

[![Web en vivo](https://img.shields.io/badge/En%20vivo-feucsc.vercel.app-000000)](https://feucsc.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448c5)](https://cloudinary.com/)

Este proyecto es un portal de transparencia enfocado para la **FEUCSC** (Federación de Estudiantes UCSC).

La idea es que cualquier estudiante pueda ver en qué se gasta el presupuesto de la federacion y, cuando corresponda, abrir el comprobante para verificar.

---

## Qué incluye

### Portal público

- Dashboard resumen (presupuesto, gastado, saldo)
- Tendencia mensual de gasto
- Vista de últimas transacciones
- Página de gastos completa con breakdown por categoría y links a comprobantes

### Panel de administración (restringido)

- Login con Google (Supabase Auth)
- Lista blanca de correos (solo cuentas autorizadas)
- Gestión de gastos y categorías
- Subida de comprobantes a Cloudinary y asociación a gastos

---

## Stack

- Next.js (App Router)
- Supabase (Postgres + Auth)
- Cloudinary (almacenamiento de comprobantes)
- SWR (fetch/caché en admin)
- Tailwind + HeroUI

---

## Estructura del proyecto

- `src/app/` — rutas (público + admin)
- `src/app/actions/` — Server Actions (escrituras DB + uploads)
- `src/lib/` — clientes Supabase, helpers de auth, utilidades
- `src/components/` — componentes UI

---

## Rutas

Público:

- `/` — dashboard
- `/gastos` — todos los gastos

Auth/Admin:

- `/login` — inicio OAuth
- `/auth/callback` — callback OAuth
- `/admin` — panel admin

---

## Modelo de datos (Supabase)

La app espera dos tablas:

### `gastos`

- `id` (uuid)
- `fecha` (`YYYY-MM-DD`)
- `descripcion`
- `categoria`
- `monto`
- `comprobante_url` (nullable)
- `creado_el` (timestamp; se usa para “última sincronización”)

### `categorias`

- `id` (uuid)
- `nombre` (unique)
- `color` (opcional `#RRGGBB`)
- `creado_el`

Al borrar una categoría, los gastos existentes se reasignan a `N/A`.

---

## Auth y control de acceso

Hay varias capas de protección (intencionalmente):

1. `middleware.ts` bloquea `/admin/*` si no hay sesión o el correo no está autorizado.
2. `src/app/admin/layout.tsx` valida sesión también en cliente (segunda barrera).
3. Las Server Actions exigen sesión válida **y** correo en whitelist antes de mutar.

La whitelist vive en `src/lib/auth.ts` (`AUTHORIZED_EMAILS`).

---

## Subida de comprobantes (Cloudinary)

La subida se hace server-side.

- Solo se aceptan imágenes (validación por magic bytes + MIME)
- Tamaño máximo: 5MB
- El `secure_url` retornado por Cloudinary se guarda en `gastos.comprobante_url`

Al borrar un gasto, se intenta borrar el archivo en Cloudinary de forma best-effort.

---

## Variables de entorno

Crea `.env.local` en `feucsc-finanzas/`.

Requeridas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo servidor)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

Opcionales (según configuración Cloudinary):

- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `CLOUDINARY_API_KEY` (solo servidor; requerido para borrado)
- `CLOUDINARY_API_SECRET` (solo servidor; requerido para borrado)

Config app:

- `NEXT_PUBLIC_PRESUPUESTO_TOTAL` (default `19972000`)

---

## Ejecutar local

```/dev/null/terminal
pnpm install
pnpm dev
```

Luego abre http://localhost:3000.

---

## Build

```/dev/null/terminal
pnpm build
pnpm start
```

---

## Notas

- Las páginas públicas usan ISR (se revalidan periódicamente) y también se revalidan después de cambios desde el admin.
- Los headers de seguridad y la CSP están configurados en `next.config.ts`.
