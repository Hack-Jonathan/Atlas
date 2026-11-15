# Atlas database (Supabase / PostgreSQL)

Etapa 2: la capa de datos. Todo es SQL versionado que se puede aplicar a un proyecto de Supabase.

## Archivos (en orden de aplicación)

| Archivo | Qué hace |
|---|---|
| `migrations/20261115000001_schema.sql` | Crea las 12 tablas, las restricciones y los triggers (llegada diferida de mensajes, inmutabilidad, consistencia de dueños) |
| `migrations/20261115000002_rls.sql` | Activa Row Level Security por rol (astronauta, cirujano de vuelo; el visitante no ve nada) |
| `seed/01_catalog.sql` | Carga el catálogo científico: 10 indicadores, 3 escenarios de incidente y 13 artículos, todos citando los documentos 01–06 |
| `seed/02_demo.sql` | Crea la misión Ares-IV y 2 cuentas demo |
| `seed/03_history.sql` | Contiene 75 días de historial simulado. **Se genera** con `npm run db:generate-history`; no hay que editarlo a mano |

## Cuentas demo (datos ficticios)

| Rol | Correo | Contraseña |
|---|---|---|
| Astronauta | `astronaut@atlas.demo` | `atlas-demo-2026` |
| Cirujano de vuelo | `surgeon@atlas.demo` | `atlas-demo-2026` |

Esta contraseña solo sirve para la demo. Hay que cambiarla en cualquier despliegue real.

## Aplicar a un proyecto Supabase

1. Crear el proyecto en supabase.com y copiar la URL, la `anon key` y la `service_role key` en `.env.local` (ver `.env.example`).
2. En **SQL Editor**, ejecutar los 5 archivos en el orden de la tabla.

   Este repositorio aún no tiene la configuración de la Supabase CLI (`config.toml`). Por eso el único camino verificado, por ahora, es el SQL Editor.
3. Los umbrales de los indicadores son **valores de demostración** (`is_demo = true`, RN-02). El equipo los puede ajustar.

## Verificación local (sin Docker ni Supabase)

`npm test` levanta PostgreSQL en memoria (PGlite) y aplica exactamente estos archivos. Antes instala un sustituto mínimo del esquema `auth` de Supabase, que vive en `scripts/db/local-db.ts` y nunca forma parte de las migraciones. Luego prueba:

- las restricciones del esquema;
- las políticas RLS por rol;
- el contenido del seed;
- que `03_history.sql` coincide con lo que produce el generador.

## Nombres: especificación → Atlas

Las tablas y columnas están en inglés por decisión del equipo.

| Especificación | Atlas |
|---|---|
| `mision` | `mission` |
| `perfil` | `profile` |
| `indicador` | `indicator` |
| `linea_base` | `baseline` |
| `chequeo` | `checkup` |
| `medicion` | `measurement` |
| `alerta` | `alert` |
| `escenario_incidente` | `incident_scenario` |
| `incidente` | `incident` |
| `mensaje` | `message` |
| `mensaje_ia` | `ai_message` |
| `articulo_biblioteca` | `library_article` |

Valores principales:

| Concepto | Especificación | Atlas |
|---|---|---|
| Semáforo | `verde` / `amarillo` / `rojo` | `green` / `yellow` / `red` |
| Rol | `astronauta` / `cirujano_vuelo` | `astronaut` / `flight_surgeon` |
| Origen | `manual` / `simulado` | `manual` / `simulated` |

El mapeo completo está en `docs/plans/stage-2-plan.md` y en `src/lib/db/enums.ts`.
