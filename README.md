# Atlas
Prototipo web de monitoreo de salud para astronautas en misiones espaciales, desarrollado para el NASA Space Apps Challenge. Visualiza datos de salud simulados y apoya el seguimiento de los riesgos de la exploración espacial.

> Prototipo con fines demostrativos. No es un dispositivo médico.

## Estado

- **Etapa 1 (entorno e interfaz base): completada.**
- **Etapa 2 (capa de datos): completada.** El SQL está listo para Supabase y verificado localmente. La app aún no se conecta a la base: eso llega en la Etapa 3.
- Los planes de cada etapa están en `docs/plans/`.

## Requisitos

- Node.js 24 o superior (probado con 26) y npm.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # opcional en la Etapa 1: las variables pueden quedar vacías
npm run dev                  # http://localhost:3000
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Genera tipos de rutas y ejecuta `tsc --noEmit` |
| `npm test` | Pruebas con Vitest: reglas, y la base de datos en PostgreSQL en memoria |
| `npm run db:generate-history` | Regenera el historial simulado (`supabase/seed/03_history.sql`) |

## Estructura

```
src/
├─ app/                 Rutas (App Router)
│  ├─ (public)/         "/" y "/login" (elección de rol)
│  ├─ (crew)/           Área del astronauta: menú de 4 opciones + botón de Incidente
│  └─ (ground)/         Consola del cirujano de vuelo
├─ components/
│  ├─ ui/               Componentes generados por shadcn/ui
│  ├─ layout/           Aviso RN-19, menú, franja de misión, página provisional
│  ├─ dashboard/        Estado "¿estoy bien?" y los 6 sistemas
│  └─ status/           Etiqueta de estado y la curva de la Tierra
├─ config/              Nombre del sitio y lista única de rutas
├─ lib/
│  ├─ rules/            Motor de reglas: semáforo, tendencia, línea base (RN-04…07)
│  ├─ db/               Valores permitidos de la base de datos (Zod)
│  ├─ demo/             Generador determinista del historial simulado
│  └─ supabase/         Clientes Supabase
└─ types/               Tipos compartidos
tests/                  Pruebas de Vitest (incluye tests/db para la base de datos)
supabase/               Migraciones SQL y datos semilla (ver supabase/README.md)
scripts/                Generador del historial y base local para pruebas
docs/plans/             Planes y revisiones de cada etapa
```

## Rutas

| Ruta | Módulo | Página |
|---|---|---|
| `/` , `/login` | M01 | Presentación y acceso |
| `/dashboard` | M02 | Panel principal y mapa corporal |
| `/checkup` | M03 | Chequeo guiado |
| `/trends`, `/indicator/[code]` | M04 | Tendencias y ficha de indicador |
| `/incident` | M05 | Modo incidente |
| `/communications` | M06 | Comunicaciones nave–tierra |
| `/ground` | M06 | Consola de tierra |
| `/assistant` | M07 | Asistente IA |
| `/library` | M07 | Biblioteca científica |
| `/settings` | M08 | Configuración y control de demo |

## Base de datos

Hay 12 tablas en PostgreSQL con Row Level Security por rol. Cómo aplicarlas y las cuentas demo: `supabase/README.md`.

## Diseño

El sistema visual ("Earth Limb") está documentado en `DESIGN.md`; el contexto de producto en `PRODUCT.md`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Supabase · Zod · Vitest.
