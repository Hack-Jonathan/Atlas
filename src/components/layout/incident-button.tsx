/**
 * The always-visible red Incident button (M05). It sits apart from the menu so
 * the emergency path is one tap away from any crew screen (RNF-02: large target).
 */
import { Siren } from "lucide-react";
import Link from "next/link";

import { routes } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function IncidentButton({ className }: { className?: string }) {
  return (
    <Link
      href={routes.incident.href}
      className={cn(
        "flex items-center gap-3 rounded-xl bg-incident px-4 py-3.5 text-white shadow-[0_8px_24px_-8px_oklch(0.55_0.2_27/60%)]",
        "transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
        className,
      )}
    >
      <Siren aria-hidden className="size-5 shrink-0" />
      <span className="leading-tight">
        <span className="block font-bold">Incident mode</span>
        <span className="hidden text-xs text-white/85 md:block">Acute situation checklist</span>
      </span>
    </Link>
  );
}
