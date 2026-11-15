---
name: Atlas
description: Astronaut health monitoring, read like the horizon from the cupola at night.
colors:
  space: "oklch(0.15 0.035 266)"
  space-raised: "oklch(0.2 0.05 265)"
  rail: "oklch(0.12 0.03 266)"
  hairline: "oklch(0.85 0.04 260 / 11%)"
  input-stroke: "oklch(0.85 0.04 260 / 18%)"
  porcelain: "oklch(0.96 0.012 262)"
  haze: "oklch(0.78 0.035 262)"
  action: "oklch(0.79 0.13 230)"
  action-foreground: "oklch(0.18 0.05 250)"
  status-ok: "oklch(0.78 0.16 155)"
  status-watch: "oklch(0.82 0.14 75)"
  status-alert: "oklch(0.65 0.21 27)"
  incident: "oklch(0.55 0.2 27)"
  status-unknown: "oklch(0.72 0.08 240)"
  disclaimer-band: "oklch(0.2 0.06 20)"
typography:
  wordmark:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    letterSpacing: "0.32em"
    fontVariation: "'wdth' 125"
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
  body-lead:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    fontFeature: "'tnum' 1"
rounded:
  sm: "7.2px"
  md: "9.6px"
  lg: "12px"
  xl: "16.8px"
  panel: "16px"
spacing:
  gutter: "24px"
  gutter-wide: "48px"
  cell-x: "20px"
  cell-y: "16px"
  rail-width: "232px"
components:
  button-action:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  button-incident:
    backgroundColor: "{colors.status-alert}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "14px 16px"
  next-step-panel:
    backgroundColor: "{colors.space-raised}"
    textColor: "{colors.porcelain}"
    rounded: "{rounded.panel}"
    padding: "20px"
  nav-link:
    textColor: "{colors.haze}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  nav-link-active:
    backgroundColor: "{colors.space-raised}"
    textColor: "{colors.porcelain}"
  system-cell:
    textColor: "{colors.haze}"
    padding: "16px 20px"
  mission-field:
    typography: "{typography.data}"
    textColor: "{colors.porcelain}"
    padding: "10px 24px"
---

# Design System: Atlas

## Overview

**Creative North Star: "The Cupola at Night"**

Atlas is seen from inside a dim cabin looking down at the night side of Earth. The whole interface is one deep blue-black field, and status reads like the horizon: a single luminous limb along the bottom of the hero that is either calm or not. Above it sits one sentence in heavy Archivo that answers "am I OK?" in plain words. Everything else is quiet furniture: hairline-ruled rows, haze-colored secondary text, mono numbers in a thin strip along the top.

Density is low at the top of each screen and rises only below the horizon, where the six body systems share one ruled row with identical furniture so they compare at a glance. Containers are rare. Structure comes from hairlines and rails, not from floating cards. Color is spent on meaning: four status hues (always with a shape and a word), one cyan action color, and the red of the Incident path.

The world must feel NASA mission-control, lively rather than muted: saturated status color, a wide tracked wordmark, and a glowing rim, all on a dark field. It rejects the health dashboard built from a grid of identical cards.

**Key Characteristics:**
- Dark only. One palette, `color-scheme: dark`, no light theme.
- The Earth limb is the signature: a curved rim in the overall status color, breathing in once on show.
- Status is always shape + word + color, never color alone.
- Hairline rules divide modules; one bordered panel per screen at most.
- Archivo for everything human; JetBrains Mono only for measurements and mission data.

## Colors

A cold night-side palette of near-black blues, lit by four status hues and one reserved cyan.

### Primary
- **Cupola Cyan** (`action`): the one next action. Fills the single primary button on a screen (Start check-up on the dashboard, the sign-in link on the landing page), strokes the Next-step panel border at 40%, and is the focus ring. At small scale it also marks navigational affordances: the active nav icon, page icons on placeholder and role rows, and the quiet detail links under the dashboard.
- **Cupola Ink** (`action-foreground`): text on a cyan fill.

### Status
- **Steady Green** (`status-ok`): level OK, word "Steady", circle-check shape.
- **Watch Amber** (`status-watch`): level watch, word "Watch", triangle shape.
- **Alert Red** (`status-alert`): level alert, word "Alert", octagon shape; also the destructive role. The Incident button uses a deeper **Incident Red** (`incident`, oklch(0.55 0.2 27)) so its white label clears 4.5:1.
- **Unknown Steel** (`status-unknown`): no data yet, word "No data yet", dashed-circle shape. It is the neutral rim color of the Earth limb.

### Neutral
- **Night Side** (`space`): page ground everywhere.
- **Cloud Band** (`space-raised`): the one raised surface: Next-step panel (at 80%), active and hovered nav items, popovers.
- **Rail Dark** (`rail`): the crew rail and the ground top bar, a step below the page.
- **Hairline** (`hairline`): every rule and border; 11% light on dark.
- **Input Stroke** (`input-stroke`): form field strokes, slightly stronger than hairline.
- **Porcelain** (`porcelain`): primary text and headings.
- **Haze** (`haze`): secondary text, labels, inactive nav, field names (7:1+ on Night Side).
- **Disclaimer Band** (`disclaimer-band`): the dark red ground of the permanent RN-19 notice, with a 30% Alert Red bottom rule.

### Named Rules
**The Shape-Word-Color Rule.** A status is never a color alone. Every status shows its shape icon and its word, and the color is the third, redundant channel. The limb is decorative (`aria-hidden`) because the sentence above it always states the status.

**The One Filled Action Rule.** Each screen has at most one cyan-filled control. Cyan may appear elsewhere only as an icon or a text link, never as a second fill.

**The Red Means Incident Rule.** A filled red control is the Incident path and nothing else.

## Typography

**Display Font:** Archivo (variable, with the `wdth` axis), falling back to system sans
**Body Font:** Archivo
**Label/Mono Font:** JetBrains Mono, for measurements and mission data only

**Character:** Archivo heavy and tight for the status sentence gives a blunt, legible answer; the same family stretched to 125% and tracked wide becomes the ATLAS wordmark. Mono is instrument text, never prose.

### Hierarchy
- **Wordmark** (800, 125% width, uppercase; rail 1.125rem / 0.32em tracking; hero 6rem to 8rem / 0.28em): the ATLAS mark only.
- **Display** (800, 3rem mobile to 4.5rem at xl, line-height 1, -0.025em): the status sentence over the horizon. One per screen.
- **Headline** (800, 2.25rem to 3rem, -0.025em): page titles on non-dashboard screens and the login question.
- **Title** (700, 1.25rem to 1.5rem): Next-step panel heading, role names on login.
- **Body Lead** (400, 1.125rem to 1.25rem, Haze): the line under a display or headline, capped near 60ch.
- **Body** (400, 1rem): running text; nav links at 15px.
- **Label** (400, 0.875rem, Haze): system names, field names, panel sub-lines. Status words in cells step up to 1.125rem semibold.
- **Data** (JetBrains Mono 400, 13px, tabular numerals): mission strip values, module codes.

### Named Rules
**The Mono Is Instrument Rule.** JetBrains Mono appears only where a value is measured or coded (mission strip, module ids). Labels beside it stay in Archivo.

**The Wide Is Brand Rule.** The 125% width is reserved for the wordmark; UI text stays at normal width.

## Layout

The crew shell is a fixed left rail (232px, Rail Dark, hairline right edge) beside a scrolling main column. The RN-19 banner sits above everything and never scrolls. The main column opens with the mission strip: a row of hairline-separated fields, mono values, horizontally scrollable on narrow screens.

The dashboard hero grows to fill spare height so the Earth limb sits low on tall screens; the limb occupies the bottom 176px (mobile), 144px (md) or 288px (xl) of the hero. The status sentence sits top-left; the Next-step panel sits top-right at xl and drops below the sentence at smaller widths. Beneath the hero, the six systems share one ruled row: 2 columns on mobile, 3 at md, 6 at xl, with vertical hairlines between cells and a hairline top and bottom.

Page gutters are 24px, widening to 48px at md. System cells pad 20px by 16px. Below md the rail becomes a top bar: wordmark and Incident on one line, nav links scrolling horizontally beneath.

The ground console uses a separate top bar (Rail Dark, hairline bottom) instead of the rail. Public pages (landing, login) center their content over a full-width Earth limb along the bottom.

## Elevation & Depth

Atlas is flat and tonal. Depth comes from three dark steps (Rail Dark below Night Side below Cloud Band) and from light, not from shadow: the atmospheric glow on the limb and the city lights under it. The single shadow in the system is the colored glow under the Incident button, which lifts the emergency path off the rail.

### Shadow Vocabulary
- **Incident glow** (`box-shadow: 0 8px 24px -8px oklch(0.55 0.2 27 / 60%)`): under the Incident button only.

### Named Rules
**The Light Not Shadow Rule.** Surfaces sit flat. When something needs presence, it is lit (glow in its own color) rather than dropped onto a shadow.

## Shapes

Gently rounded controls on a ruled, square-edged structure. Modules (the systems row, mission strip, login role list, placeholder metadata) are open rows divided by hairlines with no corners at all. Controls carry the radius: links and buttons at 12px, the Incident button at about 17px, the Next-step panel at 16px. The one recurring silhouette is the Earth rim: a quadratic arc that rises from below both edges to a crest near the top third, filled with a radial blue gradient fading to Night Side.

## Components

### Buttons
- **Shape:** gently rounded (12px).
- **Action (primary):** Cupola Cyan fill, Cupola Ink text, semibold, 10px by 16px (12px by 20px on the landing page), trailing arrow icon.
- **Press:** scales to 0.97 over 150ms on the strong ease-out curve. No hover color change.
- **Focus:** 2px Cupola Cyan outline, 2px offset, global.

### Incident Button
Always visible, always red, apart from the menu. Incident Red fill, white bold label with a smaller "Acute situation checklist" line (desktop), siren icon, 14px by 16px, about 17px radius, Incident glow beneath. Full rail width at the bottom of the rail; compact in the mobile top bar. Same 0.97 press.

### Next-Step Panel
The only bordered container on the dashboard. Cloud Band at 80%, a 1px Cupola Cyan border at 40%, 16px radius, 20px padding (24px at xl). Holds a title, one Haze sub-line, and the screen's single Action button.

### Navigation
- **Rail links:** 15px Archivo, Haze, 18px icon, 10px by 12px padding, 12px radius.
- **Hover (hover-capable devices only):** Cloud Band ground, Porcelain text.
- **Active:** Cloud Band ground, semibold Porcelain, icon in Cupola Cyan, `aria-current="page"`. Never color alone.
- **Settings:** a small Haze link below Incident, not one of the four nav items.

### Status Label
Shape icon (1.1em) in the level color beside the level word, semibold. Used in every system cell and anywhere a level is stated.

### Systems Row
Six cells of identical furniture: system name (Label, Haze), Status Label (1.125rem), one plain sentence (Label, Haze, snug leading). Cells settle in once on load (320ms, 6px rise, non-uniform delays 0 to 170ms).

### Mission Strip
A definition list along the top of the crew area. Each field: Haze name over a 13px mono Porcelain value, 10px by 24px, hairline right edge. Missing values say "Not set" in Haze rather than inventing numbers.

### Earth Limb (signature)
Decorative SVG (1200 by 300, stretched to fit): a hand-placed star field above, the planet below the rim in a radial gradient from lit blue to Night Side, sparse amber city lights at 55% just under the rim, and a three-layer rim in the overall status color (wide 34px blur at 22%, 10px blur at 50%, 2.2px crisp line). The rim group "breathes" in once (1400ms, opacity 0.35 to 1 and blur 6px to 0, strong ease-out) when shown. The same component anchors the dashboard hero, the landing page and login, always beneath content.

### Disclaimer Banner
A thin full-width band above every screen: Disclaimer Band ground, Alert Red triangle, 12px medium Porcelain text, centered.

## Do's and Don'ts

### Do:
- **Do** show every status as shape + word + color, using the four levels exactly as configured (Steady, Watch, Alert, No data yet).
- **Do** let the Earth limb carry the overall status color and keep it beneath content, `aria-hidden`.
- **Do** divide modules with hairlines (`hairline`, 1px) and give compared items identical furniture and size.
- **Do** keep one cyan-filled action per screen; press feedback is a 0.97 scale over 150ms with `cubic-bezier(0.23, 1, 0.32, 1)`.
- **Do** gate hover styles behind `@media (hover: hover)`.
- **Do** keep motion to one-time entrances (limb breathe, settle-in) and collapse it to near-instant under reduced motion.
- **Do** say "Not set" or "No data yet" when a value does not exist yet.

### Don't:
- **Don't** build the dashboard from a grid of identical floating cards; use the ruled row.
- **Don't** use a filled red control for anything but the Incident path.
- **Don't** use JetBrains Mono for labels or prose, or the 125% width for anything but the wordmark.
- **Don't** add a light theme or light surfaces; Atlas always renders in the dim-cabin palette.
- **Don't** add drop shadows to surfaces; the Incident glow is the only shadow.
