/**
 * "/communications" — Delayed ship–ground communications (module M06).
 * Stage 1 placeholder; content and title come from `routes.communications` in the navigation config.
 */
import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/config/navigation";

export const metadata: Metadata = { title: routes.communications.label };

export default function CommunicationsPage() {
  return <PagePlaceholder route={routes.communications} />;
}
