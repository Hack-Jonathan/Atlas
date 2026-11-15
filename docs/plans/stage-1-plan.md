# PLAN — Atlas, Development Stage 1: Environment setup

Source of truth: `../Especificacion_del_sistema_Atlas_v2.0.md` (section 0.4 stack, 0.5 routes, 0.6 stage order, RN-19, RNF-03/05/07/08/09).

## Goal

Create a clean, well-structured Next.js project at the root of `Atlas/` that compiles, lints, tests and renders every route from spec 0.5 as an empty, commented placeholder inside a shared layout, with Supabase wired through empty environment variables. **Only Stage 1** — no database tables, no health logic, no AI, no real UI features.

## Acceptance criteria

1. `npm install` then `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all exit 0 with no errors.
2. With `npm run start` running, each of these routes returns HTTP 200: `/`, `/login`, `/dashboard`, `/checkup`, `/trends`, `/indicator/demo`, `/incident`, `/communications`, `/ground`, `/assistant`, `/library`, `/settings`.
3. Every one of those pages contains the RN-19 disclaimer, in English: *"Demonstration prototype. Not a medical device."*
4. The app builds and runs with **empty** Supabase variables (no `.env.local` present). No page calls Supabase in Stage 1.
5. `.env.example` exists with empty `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`; `.env*.local` is git-ignored.
6. Every source file created by hand begins with a short comment explaining its purpose; non-obvious functions have a one-line JSDoc. Generated shadcn files are left as generated.
7. No medical content, thresholds or NASA requirements are written anywhere (placeholders only say which module/stage will fill them).

## Decisions (confirmed by Jonathan, 2026-11-15)

| Decision | Choice |
|---|---|
| Scope | Stage 1 only |
| App location | Next.js app at the root of `Atlas/` (next to existing `README.md`, `LICENSE`, `.git`) |
| Route & folder names | English (spec 0.5 lists Spanish; mapping below) |
| Supabase | No project yet → client code + empty env vars |
| Code style | Clean structure, one concern per folder, brief comments everywhere |
| UI language | English (spec 0.7) |

Route mapping (spec 0.5 → Atlas):

| Spec route | Atlas route | Module | User |
|---|---|---|---|
| `/` , `/login` | `/` , `/login` | M01 | Visitor / all |
| `/panel` | `/dashboard` | M02 | Astronaut |
| `/chequeo` | `/checkup` | M03 | Astronaut |
| `/tendencias`, `/indicador/[codigo]` | `/trends`, `/indicator/[code]` | M04 | Astronaut, surgeon |
| `/incidente` | `/incident` | M05 | Astronaut |
| `/comunicaciones` | `/communications` | M06 | Astronaut |
| `/tierra` | `/ground` | M06 | Flight surgeon |
| `/asistente` | `/assistant` | M07 | Both |
| `/biblioteca` | `/library` | M07 | Both |
| `/configuracion` | `/settings` | M08 | Both |

## Approach

1. **Scaffold** with `npx create-next-app@16.4.6 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --turbopack` inside `Atlas/` (create-next-app tolerates existing `.git`, `README.md`, `LICENSE`). Keep the TypeScript/React/Tailwind versions that create-next-app pins (do not force TypeScript 7). Enable `"strict": true` (RNF-09). Restore the original README content and extend it with setup instructions.
2. **shadcn/ui**: `npx shadcn@4.23.0 init` (neutral base, CSS variables), then add only `button` (`card` was added, then removed in the Revision 2 redesign because no screen uses it). More components are added in later stages when used.
3. **Dependencies added now** (stack 0.4, installed but unused beyond setup): `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `lucide-react` (from shadcn). Dev: `vitest`. Recharts and the AI SDK are **deferred** to the stages that use them (3 and 6) to keep Stage 1 minimal.
4. **Folder structure**:

```
Atlas/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                 # Root HTML, fonts, global disclaimer
│  │  ├─ globals.css                # Tailwind + theme tokens (space palette)
│  │  ├─ not-found.tsx              # 404 page
│  │  ├─ (public)/                  # Route group: visitor pages (no app shell)
│  │  │  ├─ page.tsx                # "/"  landing placeholder (M01)
│  │  │  └─ login/page.tsx          # "/login" placeholder (M01)
│  │  ├─ (crew)/                    # [Rev 2] Astronaut area (was `(app)`)
│  │  │  ├─ layout.tsx              # Rail (4 links + Incident + Settings) + mission strip
│  │     ├─ dashboard/page.tsx      # M02
│  │     ├─ checkup/page.tsx        # M03
│  │     ├─ trends/page.tsx         # M04
│  │     ├─ indicator/[code]/page.tsx  # M04 (dynamic)
│  │     ├─ incident/page.tsx       # M05
│  │     ├─ communications/page.tsx # M06
│  │     ├─ ground/page.tsx         # M06
│  │     ├─ assistant/page.tsx      # M07
│  │     ├─ library/page.tsx        # M07
│  │     └─ settings/page.tsx       # M08
│  │  └─ (ground)/ground/           # [Rev 2] Flight surgeon area, own top bar (moved out of the crew group)
│  ├─ components/
│  │  ├─ ui/                        # shadcn generated components
│  │  └─ layout/
│  │     ├─ disclaimer-banner.tsx   # RN-19 permanent notice
│  │     ├─ crew-rail.tsx           # [Rev 2] Rail shell (server; replaced sidebar-nav.tsx)
│  │     ├─ nav-links.tsx           # Link list; active highlight inside <Suspense>
│  │     └─ page-placeholder.tsx    # Shared "coming in Stage N" view
│  ├─ config/
│  │  ├─ site.ts                    # App name, tagline, disclaimer text
│  │  ├─ navigation.ts              # Single list of routes + the 4 crew menu links
│  │  ├─ status.ts, body-systems.ts # [Rev 2] Status presentation; the six M02 systems
│  ├─ lib/
│  │  ├─ utils.ts                   # shadcn `cn()` helper
│  │  ├─ env.ts                     # Zod schema for env vars (empty allowed) + isSupabaseConfigured()
│  │  └─ supabase/
│  │     ├─ client.ts               # Browser client factory (@supabase/ssr)
│  │     └─ server.ts               # Server client factory (cookies)
│  └─ types/
│     └─ navigation.ts              # NavItem type
├─ tests/
│  ├─ navigation.test.ts            # Every spec route present, unique paths
│  └─ env.test.ts                   # Empty env → not configured; filled → configured; bad URL rejected
├─ public/                          # Static assets (empty; app icon lives in src/app/icon.svg)
├─ .env.example
├─ vitest.config.mts
├─ components.json, next.config.ts, tsconfig.json, eslint.config.mjs, package.json
└─ README.md, LICENSE, PLAN.md
```

5. **Env & Supabase**: `lib/env.ts` parses env with Zod; empty strings are treated as "not set". `isSupabaseConfigured()` returns a boolean. The client factories throw a clear English error (`"Supabase is not configured: fill NEXT_PUBLIC_SUPABASE_URL ..."`) only when called without config. Nothing calls them in Stage 1. `GOOGLE_GENERATIVE_AI_API_KEY` is server-only (RNF-05) and is only declared, not read.
6. **Layout & look** *(superseded by Revision 2 below for visuals and navigation)*: dark "mission control" theme tokens in `globals.css` (deep navy background, NASA-like blue/red accents) as CSS variables usable by shadcn. `Img/` mockups are only a loose reference for information distribution; Stage 1 keeps visuals minimal (shell + placeholders), not a copy. The disclaimer banner is in the root layout so it shows on every page, including 404. The sidebar shows text label + icon for each link (RNF-03: not color-only). The layout is responsive for desktop/tablet (RNF-08): the sidebar collapses to a top bar below the `md` breakpoint.
7. **Placeholders**: each page renders `<PagePlaceholder>` with title, module code (e.g. `M02`), the stage that will implement it, and the user role. `/indicator/[code]` shows the received `code` param (escaped by React). Each page exports `metadata` with an English title.
8. **Scripts** in `package.json`: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`).

## Non-goals (later stages)

SQL tables, RLS, seed data (Stage 2); auth flow, rules engine, charts, body map (Stage 3); messaging/latency (Stage 4); incident mode (Stage 5); AI/library content (Stage 6); demo control, final polish, deploy (Stage 7). No Vercel deploy, no git commit/push unless Jonathan asks.

## Assumptions & risks

- `[INT]` English route names deviate from spec 0.5 by explicit team decision; spec still lists Spanish names.
- Disclaimer English wording is a translation of RN-19 (`[INT]` translation, not new content).
- Node 26.13.1 / npm 11.20.0 available locally (verified). Versions current as of 2026-11-15: next 16.4.6, shadcn 4.23.0, @supabase/ssr 0.12.7, zod 4.6.7, vitest 5.1.0.
- Risk: `next/font/google` needs network at build time; if it fails, fall back to `next/font/local` or system font stack.
- Risk: create-next-app could refuse a non-empty directory; fallback is scaffolding in a temp dir and copying files in, without touching `.git`, `LICENSE`.

## Verification

Run from `Atlas/`:

```
npm install
npm run lint        # expect exit 0
npm run typecheck   # expect exit 0
npm test            # expect all tests pass (navigation + env)
npm run build       # expect exit 0, all 12 routes listed in build output
npm run start       # then, in another shell:
for r in / /login /dashboard /checkup /trends /indicator/demo /incident /communications /ground /assistant /library /settings; do
  curl -s -o page.html -w "%{http_code} $r\n" http://localhost:3000$r
  grep -q "Not a medical device" page.html && echo "  disclaimer OK"
done
```

Expected: 12 × `200` and 12 × `disclaimer OK`. `curl /does-not-exist` returns 404 and still contains the disclaimer.

Manual/visual: screenshot `/`, `/dashboard` at desktop (1440px) and tablet (768px) widths with Playwright to confirm the shell, rail collapse (Rev 2: rail) and banner render; Rev 2 adds 1024x768 and 390x844. Confirm `git status` shows no `.env.local` and no build artifacts (`.next/`, `node_modules/`) staged.

## Build deviations (recorded after implementation, 2026-11-15)

- `@types/node` raised from the scaffold's `^20` to `^24` (Vitest 5 peer requirement).
- Vitest config is `vitest.config.mts` (ESM) instead of `.ts`, to avoid Vite's CommonJS-loader warning.
- Sidebar split into `sidebar-nav.tsx` (server) + `nav-links.tsx` (client). Under Cache Components, `usePathname()` must render inside `<Suspense>`; the fallback shows the same links without the active highlight.
- shadcn 4.23 installs the `cn` package and the `shadcn` runtime package (for `shadcn/tailwind.css`); `src/lib/utils.ts` re-exports `cn`.
- Scaffold was generated in a temp folder and copied in, so `.git`, `LICENSE` and the plan files were untouched. `AGENTS.md` (Next.js agent notes) was kept from the scaffold. Default Next.js boilerplate assets were removed; `src/app/icon.svg` added.
- M01 pages (`/`, `/login`) show "Stage to be scheduled": spec 0.6 does not assign authentication to a stage.

## Revision 2 — UI redesign (approved by Jonathan, 2026-11-15)

Reason: Jonathan rejected the first shell as dull, with too many menu options. Scope stays Stage 1: shell + honest empty states, no health values.

- **Navigation** (supersedes "sidebar with all pages"): the astronaut menu has only 4 links: Dashboard, Check-up, Communications, Assistant. Incident mode is an always-visible red button apart from the menu. Settings is a small icon or link. Trends and Library are reached from the dashboard. The Ground console is a separate `(ground)` route group with its own top bar and a "Switch role" link. `/login` offers the role choice (astronaut or flight surgeon), with no auth yet.
- **Visual world "Earth Limb"** (chosen via impeccable; contract in `.impeccable/surfaces/`, system in `DESIGN.md`):
  - Night-side Earth palette in OKLCH tokens, with Archivo and JetBrains Mono.
  - Signature: an SVG atmospheric limb that takes the overall status color.
  - Status is always shape + word + color (RNF-03).
- **Dashboard (M02):**
  - Status sentence with a single next-step (Check-up).
  - The six M02 systems with "No data yet", plus what each watches (from the spec's indicator catalog).
  - Mission strip marked "Not set · Stage 2".
- **Unchanged acceptance criteria:** the 12 routes return 200, the RN-19 disclaimer is on every page, the app runs with empty env, and lint/typecheck/test/build pass. Tests updated: `crewNavItems` has exactly the 4 approved links and excludes incident, settings and ground.
- **Reviews:**
  - An impeccable finish review returned "fix" (8 fixes); all 8 were scored resolved, plus 2 regressions that were then fixed.
  - Incident fill darkened (`--incident`) for 4.5:1 label contrast.
