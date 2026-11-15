/**
 * "/ground" — Ground console for the flight surgeon (module M06).
 * Stage 1 placeholder; content and title come from `routes.ground` in the navigation config.
 */
import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/config/navigation";

export const metadata: Metadata = { title: routes.ground.label };

export default function GroundPage() {
  return <PagePlaceholder route={routes.ground} />;
}
