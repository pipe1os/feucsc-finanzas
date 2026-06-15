# Portal de Transparencia Financiera FEUCSC

[![Web en vivo](https://img.shields.io/badge/En%20vivo-feucsc.vercel.app-000000)](https://feucsc.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448c5)](https://cloudinary.com/)
[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](https://github.com/pipe1os/FEUCSC-FINANZAS/actions/workflows/ci.yaml)


[Read in English →](./README.md)

Portal de transparencia financiera hecho para la FEUCSC (Federación de Estudiantes UCSC).
## Características

### Portal público

- Dashboard resumen (presupuesto, gastado, saldo)
- Tendencia mensual de gastos
- Vista de últimas transacciones
- Página de gastos completa con desglose por categoría y enlaces a comprobantes

### Panel de administración (restringido)

- Inicio de sesión con Google (Supabase Auth)
- Lista blanca de correos dinámica en la base de datos (solo cuentas aprobadas tienen acceso)
- Gestión de gastos y categorías
- Subida segura de comprobantes a Cloudinary
- Vista previa y eliminación de comprobantes

## Tecnologías

- Next.js (App Router)
- Supabase (Postgres + Auth)
- Cloudinary (almacenamiento de comprobantes)
- SWR (fetch/caché en admin)
- Tailwind CSS
- HeroUI
- Zod (validación en el servidor)
- Vitest

## Seguridad

Múltiples capas protegen las acciones administrativas y la subida de archivos.

### Autenticación y autorización

- OAuth con Google mediante Supabase Auth
- **Row Level Security (RLS):** Las operaciones en la base de datos están restringidas a correos autorizados mediante políticas de Supabase.
- La lista blanca dinámica restringe el acceso en Next.js (middleware/Server Actions) y en la base de datos.
- Rutas de administración protegidas vía `middleware.ts`
- Las Server Actions requieren usuarios autenticados y autorizados

### Subidas seguras

Las subidas de comprobantes ocurren completamente del lado del servidor.

- Las subidas evitan el navegador; van desde Next.js hacia Cloudinary.
- Los secretos de la API de Cloudinary permanecen en el servidor.
- La validación por "magic-bytes" verifica las firmas reales de los archivos.
- Formatos soportados: JPEG, PNG, GIF, WebP.
- Tamaño máximo de subida: 5MB.
- Cloudinary restringe los archivos a la carpeta `comprobantes/`.
- Las subidas utilizan el Cloudinary SDK con firmas en el servidor.

### Eliminaciones seguras

- La eliminación de comprobantes requiere autenticación.
- Las eliminaciones en Cloudinary usan peticiones firmadas en el servidor.
- Los usuarios solo pueden eliminar recursos dentro de la carpeta `comprobantes/`.

## Instalación

### Prerrequisitos

- Node.js (v18+)
- pnpm (v9+)
- Un proyecto en Supabase
- Una cuenta en Cloudinary

### Configuración

1. Clona el repositorio e instala las dependencias:

```bash
pnpm install
```

2. Crea `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_PRESUPUESTO_TOTAL=19972000
```

## Uso

### Desarrollo local

Inicia el servidor de desarrollo:

```bash
pnpm dev
```

Abre `http://localhost:3000`.

### Build de producción

```bash
pnpm build
pnpm start
```

### Rutas

**Público:**
- `/`: dashboard
- `/gastos`: todos los gastos
- `/faq`: lista dinámica de preguntas frecuentes
- `/contacto`: formulario y detalles de contacto

**Auth/Admin:**
- `/login`: inicio con Google OAuth
- `/auth/callback`: callback de OAuth
- `/admin`: panel de administración

## Calidad y Testing

Las pruebas automatizadas y los flujos de CI aseguran confiabilidad, seguridad y calidad del frontend.

### Pruebas automatizadas

La cobertura incluye helpers de autenticación, lógica de validación de subidas y validación de firmas/magic-bytes de imágenes.

Ejecuta las pruebas localmente:

```bash
pnpm test
```

## CI/CD

Los workflows de GitHub Actions se ejecutan en cada push a `main` y en los Pull Requests:

- Linting de código (`eslint`)
- Verificación estática de tipos (`tsc`)
- Ejecución de pruebas automatizadas (`vitest`)
- Validación del build de producción
- Auditoría de rendimiento frontend con Lighthouse CI

## Estructura del proyecto

- `src/app/`: rutas (público y admin)
- `src/app/actions/`: Server Actions para escrituras en la DB y subidas
- `src/lib/`: clientes de Supabase, helpers de autenticación, configuración de Cloudinary, utilidades, utilidades de prueba
- `src/components/`: componentes de la interfaz
- `src/hooks/`: hooks de datos de SWR

## Modelo de datos (Supabase)

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

### `categorias`

| Columna | Tipo |
|---|---|
| `id` | uuid |
| `nombre` | unique text |
| `color` | optional hex `#RRGGBB` |
| `creado_el` | timestamp |

Cuando los usuarios eliminan una categoría, los gastos existentes se reasignan a `N/A`.

### `admins`

| Columna | Tipo |
|---|---|
| `id` | uuid |
| `email` | unique text |
| `creado_el` | timestamp |

Las políticas de RLS y el middleware de Next.js consultan esta tabla para conceder acceso.

## Control de acceso y Autenticación

1. **RLS en Base de Datos:** Supabase aplica "Row Level Security". Solo los usuarios con correos en la tabla `admins` pueden realizar operaciones INSERT, UPDATE o DELETE.
2. `middleware.ts` bloquea `/admin/*` si el correo de la sesión no se encuentra en la lista de `admins`.
3. `src/app/admin/layout.tsx` valida la sesión del lado del servidor antes de renderizar la interfaz de usuario.
4. Las Server Actions requieren una sesión autenticada, un correo autorizado y payloads válidos.

`src/lib/auth.ts` consulta la tabla de administradores usando la Service Role Key para evitar dependencias circulares de RLS durante las verificaciones de acceso.

## Notas

- Las páginas públicas usan ISR y revalidan después de escrituras desde administración.
- `next.config.ts` configura cabeceras de seguridad y CSP.
- Las subidas a Cloudinary usan exclusivamente subidas firmadas en el servidor.
- El proyecto prefiere la validación explícita del lado del servidor junto con políticas estrictas de Postgres RLS.

## Licencia

Propiedad privada - Todos los derechos reservados.
