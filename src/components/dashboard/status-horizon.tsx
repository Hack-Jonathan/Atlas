/**
 * Top of the dashboard: the plain-language answer to "am I OK?" set above the
 * Earth limb, plus the one highlighted next step. The limb and the sentence share
 * the same status level. Stage 1 shows the honest empty state (no check-up yet).
 * The section grows to fill spare height so the limb sits lower on tall screens.
 */
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { EarthLimb } from "@/components/status/earth-limb";
import { routes } from "@/config/navigation";
import { statusPresentation } from "@/config/status";
import { cn } from "@/lib/utils";
import type { StatusLevel } from "@/types/status";

export function StatusHorizon() {
  const level: StatusLevel = "unknown";
  const { icon: StatusIcon, label: statusWord, textClass } = statusPresentation[level];

  return (
    <section
      aria-labelledby="status-heading"
      className="relative isolate flex grow flex-col overflow-hidden px-6 pt-10 pb-28 md:px-12 md:pt-8 md:pb-20 xl:pt-12 xl:pb-44"
    >
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 md:h-36 xl:h-72">
        <EarthLimb level={level} />
      </div>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between xl:gap-10">
        <div className="max-w-3xl">
          <h1
            id="status-heading"
            className="flex items-start gap-4 text-5xl font-extrabold tracking-tight xl:text-7xl"
          >
            {/* Shape + word for the status (RNF-03); the sentence itself is the status. */}
            <StatusIcon aria-hidden className={cn("mt-[0.12em] size-[0.8em] shrink-0", textClass)} />
            <span>
              <span className="sr-only">{statusWord}: </span>
              {/* No-break space + non-breaking hyphen keep "No check-up" together. */}
              No check‑up yet today
            </span>
          </h1>
          <p className="mt-4 text-lg text-haze md:text-xl">
            Your status appears here after your first check‑up.
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-2xl border border-action/40 bg-space-raised/80 p-5 sm:flex-row sm:items-center sm:justify-between xl:w-auto xl:max-w-sm xl:flex-col xl:items-start xl:p-6">
          <div>
            <h2 className="text-2xl font-bold">{routes.checkup.label}</h2>
            <p className="mt-1 text-sm text-haze">Guided, step by step. Under 5 minutes.</p>
          </div>
          <Link
            href={routes.checkup.href}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-action px-4 py-2.5 font-semibold text-action-foreground transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97] sm:self-auto xl:self-start"
          >
            Start check‑up
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
