/**
 * "/indicator/[code]" — Detail sheet of one indicator (module M04).
 * Stage 1 placeholder: only echoes the received code (React escapes it).
 * With Cache Components, reading `params` is runtime data, so it lives inside <Suspense>.
 */
import type { Metadata } from "next";
import { Suspense } from "react";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { routes } from "@/config/navigation";

export const metadata: Metadata = { title: routes.indicator.label };

/** Reads the dynamic segment and shows it. */
async function IndicatorCode({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <p>
      Requested indicator code: <code className="font-mono">{code}</code>
    </p>
  );
}

export default function IndicatorPage({ params }: PageProps<"/indicator/[code]">) {
  return (
    <PagePlaceholder route={routes.indicator}>
      <Suspense fallback={<p className="text-muted-foreground">Loading indicator…</p>}>
        <IndicatorCode params={params} />
      </Suspense>
    </PagePlaceholder>
  );
}
