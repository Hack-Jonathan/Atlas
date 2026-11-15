/**
 * "/library" — Verified scientific library (module M07).
 * Stage 1 placeholder; content and title come from `routes.library` in the navigation config.
 */
import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/config/navigation";

export const metadata: Metadata = { title: routes.library.label };

export default function LibraryPage() {
  return <PagePlaceholder route={routes.library} />;
}
