/**
 * "/dashboard" — Main panel (module M02): "am I OK?" first, then the six body
 * systems, then quiet links to the detail pages (Trends, Library).
 * Stage 1: honest empty state; real status arrives with the rules engine (Stage 3).
 */
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { StatusHorizon } from "@/components/dashboard/status-horizon";
import { SystemsRow } from "@/components/dashboard/systems-row";
import { routes } from "@/config/navigation";

export const metadata: Metadata = { title: routes.dashboard.label };

/** Detail pages reached from the dashboard instead of the main menu. */
const detailLinks = [routes.trends, routes.library];

export default function DashboardPage() {
  return (
    <>
      <StatusHorizon />
      <SystemsRow />
      <nav aria-label="More detail" className="flex flex-wrap gap-x-8 gap-y-3 px-6 py-6 md:px-12">
        {detailLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group inline-flex items-center gap-2 text-sm font-medium text-action"
            >
              <Icon aria-hidden className="size-4" />
              {link.label}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-150 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:translate-x-0.5"
              />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
