/**
 * Left rail of the astronaut area (server component):
 * wordmark, the four main links, then the fixed Incident button and a small Settings icon.
 * Below `md` it becomes a top bar: links scroll horizontally, Incident stays visible.
 */
import { Settings } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { IncidentButton } from "@/components/layout/incident-button";
import { ActiveNavLinks, NavLinks } from "@/components/layout/nav-links";
import { Wordmark } from "@/components/layout/wordmark";
import { routes } from "@/config/navigation";

export function CrewRail() {
  return (
    <aside className="flex shrink-0 flex-col gap-3 border-b border-hairline bg-rail px-3 py-3 md:w-58 md:gap-0 md:border-r md:border-b-0 md:px-3.5 md:py-6">
      <div className="flex items-center justify-between gap-3 px-2 md:pb-7">
        <Wordmark />
        <div className="flex items-center gap-1 md:hidden">
          <IncidentButton className="py-2" />
          <Link
            href={routes.settings.href}
            aria-label={routes.settings.label}
            className="grid size-10 place-items-center rounded-lg text-haze"
          >
            <Settings aria-hidden className="size-5" />
          </Link>
        </div>
      </div>

      <nav aria-label="Main navigation">
        <Suspense fallback={<NavLinks pathname={null} />}>
          <ActiveNavLinks />
        </Suspense>
      </nav>

      <div className="mt-auto hidden flex-col gap-3 md:flex">
        <IncidentButton />
        <Link
          href={routes.settings.href}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-haze [@media(hover:hover)]:hover:text-porcelain"
        >
          <Settings aria-hidden className="size-4" />
          {routes.settings.label}
        </Link>
      </div>
    </aside>
  );
}
