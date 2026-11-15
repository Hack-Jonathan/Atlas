/**
 * Permanent notice required by RN-19 on every screen:
 * "Demonstration prototype. Not a medical device."
 * Rendered once in the root layout, so every page (including 404) shows it.
 */
import { TriangleAlert } from "lucide-react";

import { siteConfig } from "@/config/site";

export function DisclaimerBanner() {
  return (
    <div
      role="note"
      aria-label="Prototype disclaimer"
      className="flex shrink-0 items-center justify-center gap-2 border-b border-status-alert/30 bg-[oklch(0.2_0.06_20)] px-4 py-1.5 text-center text-xs font-medium text-porcelain"
    >
      <TriangleAlert aria-hidden className="size-3.5 shrink-0 text-status-alert" />
      <span>{siteConfig.disclaimer}</span>
    </div>
  );
}
