# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Astronaut on a long-duration mission (primary).** No medical training, under workload, with delayed support from Earth. Job: do a quick daily self-check, know at a glance whether they are OK, and act (or escalate) when something changes.
- **Flight surgeon on the ground.** Reviews delayed reports in a prioritized console and replies.
- **Hackathon judges (NASA Space Apps Challenge 2026).** Evaluate the demo. Design for the astronaut first; realistic clarity is what convinces the judges (confirmed 2026-11-15).

## Product Purpose

Atlas monitors and guides astronaut health on long missions: guided self-assessment, comparison against the person's own baseline, incident checklists for documented acute situations, and ship–ground messaging with simulated communication delay, plus an AI assistant that explains results. Success: the astronaut understands their status in seconds and the surgeon sees what matters first.

## Positioning

Personal-baseline monitoring (not population ranges) combined with delay-aware ship–ground communication and incident checklists, with every health statement traced to NASA HRP / CSA documents.

## Operating Context

- Daily check-up completes in under 5 minutes (RNF-01).
- Incident mode is used under stress: big buttons, one main decision per step (RNF-02).
- Desktop and tablet in modern Chrome/Edge; phone must render correctly but is not the priority (RNF-08, confirmed 2026-11-15).
- Six body systems/environment groups drive the dashboard status: cardiovascular, bone/muscle, neuro-ocular, behavioral & sleep, immune/metabolic, environment/radiation (spec M02).

## Capabilities and Constraints

- Source of truth: `../Especificacion_del_sistema_Atlas_v2.0.md`; health content only from `../Documentacion/01_`–`06_`.
- Monitors and guides; never diagnoses or prescribes. AI never decides the traffic light.
- Separate manual self-assessment from simulated telemetry/exams (RN-03).
- Stack: Next.js App Router + TypeScript, Tailwind + shadcn/ui, Recharts, Supabase, Zod, Vercel AI SDK (Gemini), Vitest.
- UI language: English. Code in English.

## Brand Commitments

- Name: **Atlas**. Must feel clearly NASA / mission-control, lively, not muted.
- Permanent disclaimer on every screen (RN-19): "Demonstration prototype. Not a medical device."
- `../Img/` Figma screenshots are only a guide for information layout, never a visual or content requirement.

## Evidence on Hand

- Six analysis documents in `../Documentacion/` (NASA HRP, CSA). No real patient data; all measurements are simulated demo data. No testimonials, partners or endorsements exist — never imply NASA endorsement.

## Product Principles

1. "Am I OK?" first: status in plain words + traffic light before any number or chart; charts are opt-in detail.
2. Fewest choices possible for the astronaut; emergency (Incident) is always one tap away.
3. Every health claim is labeled and sourced ([DOC], [INT], demo parameter).
4. Status never depends on color alone (RNF-03).
5. Calm under pressure: clarity over decoration in Incident and Check-up.

## Accessibility & Inclusion

Status = icon + text label + color (RNF-03). Plain language; every space term explained (RNF-01). Large touch targets in Incident mode (RNF-02).
