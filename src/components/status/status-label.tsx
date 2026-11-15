/**
 * A status shown as icon (shape) + word, colored by level.
 * Never color alone (RNF-03).
 */
import { statusPresentation } from "@/config/status";
import { cn } from "@/lib/utils";
import type { StatusLevel } from "@/types/status";

interface StatusLabelProps {
  level: StatusLevel;
  className?: string;
}

export function StatusLabel({ level, className }: StatusLabelProps) {
  const { icon: Icon, label, textClass } = statusPresentation[level];
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <Icon aria-hidden className={cn("size-[1.1em] shrink-0", textClass)} />
      <span>{label}</span>
    </span>
  );
}
