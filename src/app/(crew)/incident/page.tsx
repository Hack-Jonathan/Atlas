/**
 * "/incident" — Incident mode for documented acute situations (module M05).
 * Stage 1 placeholder; content and title come from `routes.incident` in the navigation config.
 */
import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/config/navigation";

export const metadata: Metadata = { title: routes.incident.label };

export default function IncidentPage() {
  return <PagePlaceholder route={routes.incident} />;
}
