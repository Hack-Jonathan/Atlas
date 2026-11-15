/**
 * "/settings" — Settings and demo control (module M08).
 * Stage 1 placeholder; content and title come from `routes.settings` in the navigation config.
 */
import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/config/navigation";

export const metadata: Metadata = { title: routes.settings.label };

export default function SettingsPage() {
  return <PagePlaceholder route={routes.settings} />;
}
