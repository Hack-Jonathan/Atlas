/**
 * "/assistant" — Conversational AI assistant (module M07).
 * Stage 1 placeholder; content and title come from `routes.assistant` in the navigation config.
 */
import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/config/navigation";

export const metadata: Metadata = { title: routes.assistant.label };

export default function AssistantPage() {
  return <PagePlaceholder route={routes.assistant} />;
}
