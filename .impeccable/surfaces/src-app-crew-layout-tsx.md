---
version: 1
slug: "src-app-crew-layout-tsx"
primary_target: "src/app/(crew)/layout.tsx"
related_targets: ["src/app/(crew)/dashboard/page.tsx","src/app/(ground)/ground/page.tsx","src/app/(public)/page.tsx"]
---

Scope: Atlas app shell (crew area: dashboard, check-up, communications, assistant, trends, indicator, incident, library, settings; ground console shell; landing + login). Mode: Operate (landing: light Persuade inside the same world).
Audience/job: astronaut, desktop/tablet, dim cabin; learn "am I OK?" in seconds, then act. Flight surgeon gets a separate console shell. Stage 1 = shell + honest empty states, no health values.
Constraints: RN-19 banner on every screen; status = shape + word + color (RNF-03); Incident one tap away; 4 nav items only.

## Direction contract
THESIS: Status reads like the horizon seen from the cupola: one luminous line that is either calm or not. Refuses the grid-of-same-cards health dashboard.
OWN-WORLD: Night-side Earth ground (#060b1a → #0f1d3d), atmospheric limb in cyan #4cc3ff when neutral, green #3fd08a OK, amber #f6b54a watch, red #e8423b alert/incident; porcelain text #eef3ff. Archivo (wide for brand, normal for UI), JetBrains Mono only for measurements. Hairline #ffffff14 module rules, no floating cards.
STORY: The astronaut opens Atlas, reads the sentence over the horizon, sees which of six systems needs attention, and takes the one highlighted next step; emergency is always the red button.
FIRST VIEWPORT: Left rail 232px: wordmark, Dashboard/Check-up/Communications/Assistant, spacer, full-width red Incident button, small Settings icon. Top mission strip (mission, day, Earth-link delay, cabin dose) in mono. Hero 380px: curved limb arc across the bottom, status sentence 64–72px top-left, Next-step panel right (only element in the reserved cyan action color). Below: six systems in one hairline-ruled row, identical furniture (name, state shape+word, one sentence). Then quiet links to Trends and Library.
FORM: candidate 3 of 7 (Earth limb / cupola night side), seed:4cc8facea8f44d04. Raises: hairline module system; fixed furniture per system; identical scale per system; one reserved action color; state never color-only. Signature move: the limb arc takes the overall status color and breathes once on load / on status change.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
