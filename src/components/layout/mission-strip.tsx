/**
 * Top strip of the crew area: mission name, mission day, Earth-link delay and cabin dose.
 * In Stage 1 there is no mission data yet (table `mision` arrives in Stage 2), so every
 * value is marked "Not set" instead of showing invented numbers.
 */
const fields = [
  { label: "Mission", value: null },
  { label: "Mission day", value: null },
  { label: "Earth link delay", value: null },
  { label: "Cabin dose", value: null },
] as const;

export function MissionStrip() {
  return (
    <dl className="flex shrink-0 overflow-x-auto border-b border-hairline text-xs">
      {fields.map((field) => (
        <div key={field.label} className="shrink-0 border-r border-hairline px-5 py-2.5 md:px-6">
          <dt className="text-haze">{field.label}</dt>
          <dd className="mt-0.5 font-mono text-[13px] text-porcelain tabular-nums">
            {field.value ?? <span className="text-haze">Not set · Stage 2</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
