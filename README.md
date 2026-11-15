# Atlas
Prototipo web de monitoreo de salud para astronautas en misiones espaciales, desarrollado para el NASA Space Apps Challenge. Visualiza datos de salud simulados y apoya el seguimiento de los riesgos de la exploración espacial.

> Prototipo con fines demostrativos. No es un dispositivo médico.

## Estado

**Etapa 1 de desarrollo (entorno) completada.** Todas las rutas existen como páginas provisionales; el contenido llega en las etapas 2–7 (ver `PLAN.md` y la especificación del sistema).

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
| `npm test` | Pruebas unitarias con Vitest |

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
├─ lib/                 Utilidades, validación de entorno (Zod), clientes Supabase
└─ types/               Tipos compartidos
tests/                  Pruebas de Vitest
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

## Diseño

El sistema visual ("Earth Limb") está documentado en `DESIGN.md`; el contexto de producto en `PRODUCT.md`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Supabase · Zod · Vitest.
