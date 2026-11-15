/**
 * "/checkup" — Guided self-assessment check-up (module M03).
 * Stage 1 placeholder; content and title come from `routes.checkup` in the navigation config.
 */
import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/config/navigation";

export const metadata: Metadata = { title: routes.checkup.label };

export default function CheckupPage() {
  return <PagePlaceholder route={routes.checkup} />;
}
