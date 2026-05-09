# Portal de Transparencia Financiera FEUCSC

[![Web en vivo](https://img.shields.io/badge/En%20vivo-feucsc.vercel.app-000000)](https://feucsc.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448c5)](https://cloudinary.com/)

Este proyecto es un portal de transparencia enfocado para la **FEUCSC** (Federación de Estudiantes UCSC).

La idea es que cualquier estudiante pueda ver en qué se gasta el presupuesto de la federación y, cuando corresponda, abrir el comprobante para verificar.

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
- Subida segura de comprobantes a Cloudinary
- Vista previa y eliminación de comprobantes

---

## Stack

- Next.js (App Router)
- Supabase (Postgres + Auth)
- Cloudinary (almacenamiento de comprobantes)
- SWR (fetch/caché en admin)
- Tailwind CSS
- HeroUI

---

## Seguridad

La aplicación utiliza múltiples capas de protección para administración y uploads.

### Auth y autorización

- OAuth con Google mediante Supabase Auth
- Lista blanca de correos autorizados
- Protección de rutas admin vía `middleware.ts`
- Server Actions protegidas server-side

### Uploads seguros

La subida de comprobantes es completamente server-side.

Protecciones implementadas:

- Los uploads nunca van directo desde navegador → Cloudinary
- El secreto de Cloudinary nunca se expone al cliente
- Validación por magic bytes
- Restricción de tipos de archivo (JPEG, PNG, GIF, WebP)
- Límite de tamaño: 5MB
- Restricción de carpeta Cloudinary (`comprobantes/`)
- Uploads firmados usando Cloudinary SDK

### Eliminación segura

- El borrado requiere autenticación
- Solo se pueden eliminar archivos dentro de `comprobantes/`
- Las requests de borrado son firmadas server-side

---

## Estructura del proyecto

- `src/app/` — rutas (público + admin)
- `src/app/actions/` — Server Actions (DB + uploads)
- `src/lib/` — clientes Supabase, auth, configuración Cloudinary y utilidades
- `src/components/` — componentes UI
- `src/hooks/` — hooks SWR

---

## Rutas

### Público

- `/` — dashboard
- `/gastos` — todos los gastos

### Auth/Admin

- `/login` — inicio OAuth
- `/auth/callback` — callback OAuth
- `/admin` — panel admin

---

## Modelo de datos (Supabase)

La app espera dos tablas:

### `gastos`

| Columna | Tipo |
|---|---|
| `id` | uuid |
| `fecha` | `YYYY-MM-DD` |
| `descripcion` | text |
| `categoria` | text |
| `monto` | numeric |
| `comprobante_url` | nullable text |
| `creado_el` | timestamp |

`creado_el` se usa para indicadores de sincronización y revalidación.

---

### `categorias`

| Columna | Tipo |
|---|---|
| `id` | uuid |
| `nombre` | unique text |
| `color` | opcional `#RRGGBB` |
| `creado_el` | timestamp |

Al eliminar una categoría, los gastos existentes se reasignan a `N/A`.

---

## Auth y control de acceso

Hay múltiples capas de protección (intencionalmente):

1. `middleware.ts` bloquea `/admin/*` si no hay sesión o el correo no está autorizado.
2. `src/app/admin/layout.tsx` valida sesión también en cliente como segunda barrera.
3. Las Server Actions exigen:
   - sesión autenticada
   - correo autorizado
   - payload válido

La whitelist vive en:

```txt
src/lib/auth.ts
```

mediante la constante:

```txt
AUTHORIZED_EMAILS
```

---

## Subida de comprobantes (Cloudinary)

Los uploads se procesan completamente server-side usando Cloudinary SDK.

### Flujo de upload

```txt
Navegador → Server Action → Cloudinary
```

El cliente nunca recibe:
- API secret de Cloudinary
- credenciales firmadas

### Validaciones de upload

Antes de subir un archivo se valida:

- Autenticación
- Tamaño
- MIME type
- Magic bytes / firma del archivo

Formatos permitidos:

- JPEG
- PNG
- GIF
- WebP

Tamaño máximo:

```txt
5 MB
```

Los archivos se almacenan en:

```txt
comprobantes/
```

en Cloudinary.

La URL pública (`secure_url`) se guarda en:

```txt
gastos.comprobante_url
```

---

## Eliminación de comprobantes

Al eliminar un gasto, la aplicación intenta eliminar el archivo asociado en Cloudinary.

Protecciones:

- Requiere auth
- Requests firmadas server-side
- Restricción por carpeta (`comprobantes/`)

---

## Variables de entorno

Crea:

```txt
.env.local
```

en la raíz del proyecto.

---

### Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

### Configuración opcional

```env
NEXT_PUBLIC_PRESUPUESTO_TOTAL=19972000
```

---

## Ejecutar localmente

```bash
pnpm install
pnpm dev
```

Luego abre:

```txt
http://localhost:3000
```

---

## Build producción

```bash
pnpm build
pnpm start
```

---

## Notas

- Las páginas públicas usan ISR y también se revalidan después de cambios desde admin.
- Los headers de seguridad y CSP están configurados en `next.config.ts`.
- Los uploads a Cloudinary son firmados server-side.
- Ya no se utilizan upload presets públicos.
- El proyecto prioriza arquitectura simple y validaciones explícitas server-side.
