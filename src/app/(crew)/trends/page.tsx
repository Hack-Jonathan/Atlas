/**
 * "/trends" — Trends against the personal baseline (module M04).
 * Stage 1 placeholder; content and title come from `routes.trends` in the navigation config.
 */
import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/config/navigation";

export const metadata: Metadata = { title: routes.trends.label };

export default function TrendsPage() {
  return <PagePlaceholder route={routes.trends} />;
}
