/**
 * The six body systems in one hairline-ruled row. Every system has the same
 * furniture (name, status shape + word, one plain sentence) and the same size,
 * so they compare at a glance. Stage 1: every system is "No data yet" and the
 * sentence says what the system watches.
 */
import { StatusLabel } from "@/components/status/status-label";
import { bodySystems } from "@/config/body-systems";
import type { StatusLevel } from "@/types/status";

/** Small non-uniform delays (ms) for the one-time settle-in on load. */
const settleDelays = [0, 40, 70, 110, 140, 170];

export function SystemsRow() {
  const level: StatusLevel = "unknown";

  return (
    <section aria-labelledby="systems-heading">
      <h2 id="systems-heading" className="sr-only">
        Body systems
      </h2>
      <ul className="grid grid-cols-2 border-y border-hairline md:grid-cols-3 xl:grid-cols-6">
        {bodySystems.map((system, index) => (
          <li
            key={system.code}
            style={{ animationDelay: `${settleDelays[index]}ms` }}
            className="border-hairline px-5 py-4 not-last:border-r md:max-xl:py-3 motion-safe:animate-[settle-in_320ms_var(--ease-out)_both] max-xl:border-b"
          >
            <p className="text-sm text-haze">{system.label}</p>
            <StatusLabel level={level} className="mt-2.5 text-lg" />
            <p className="mt-1.5 text-sm leading-snug text-haze">{system.watches}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
