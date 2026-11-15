/**
 * The six body systems / environment groups the dashboard is organized by
 * (spec M02: `sistema_codigo`). Codes match the database values of Stage 2;
 * labels are plain-English names for the astronaut ([INT] wording); `watches` lists
 * what each system tracks, taken from the indicator catalog in spec Part 3.
 */
export const bodySystems = [
  { code: "cardiovascular", label: "Heart & circulation", watches: "Heart rate and blood pressure." },
  { code: "oseo_muscular", label: "Bone & muscle", watches: "Bone density from periodic scans." },
  { code: "neuro_ocular", label: "Eyes & brain", watches: "Periodic eye exam and eye scan." },
  { code: "conductual_sueno", label: "Sleep & mood", watches: "Hours of sleep and mood." },
  { code: "inmune_metabolico", label: "Immune & metabolism", watches: "Temperature and blood glucose." },
  { code: "entorno_radiacion", label: "Radiation & cabin", watches: "Radiation dose from cabin sensors." },
] as const;

/** Database code of a body system, e.g. `"cardiovascular"`. */
export type BodySystemCode = (typeof bodySystems)[number]["code"];
