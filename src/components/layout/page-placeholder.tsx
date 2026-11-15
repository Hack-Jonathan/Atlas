/**
 * Shared "coming in a later stage" view for pages not built yet.
 * It only shows metadata from the navigation config (module, stage, users);
 * it never shows health content.
 */
import type { ReactNode } from "react";

import { roleLabels } from "@/config/navigation";
import type { RouteInfo } from "@/types/navigation";

interface PagePlaceholderProps {
  /** Route being rendered, taken from `routes` in the navigation config. */
  route: RouteInfo;
  /** Optional extra content (e.g. links or the received URL parameter). */
  children?: ReactNode;
}

export function PagePlaceholder({ route, children }: PagePlaceholderProps) {
  const Icon = route.icon;
  const stageText =
    route.stage === null ? "Stage to be scheduled" : `Development stage ${route.stage}`;

  return (
    <section className="w-full max-w-3xl px-6 py-12 md:px-12 md:py-16">
      <Icon aria-hidden className="size-8 text-action" />
      <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">{route.label}</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-haze">{route.summary}</p>

      <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 border-y border-hairline py-4 text-sm">
        <dt className="py-1 text-haze">Module</dt>
        <dd className="py-1 font-mono tabular-nums">{route.module}</dd>
        <dt className="py-1 text-haze">Built in</dt>
        <dd className="py-1">{stageText}</dd>
        <dt className="py-1 text-haze">Used by</dt>
        <dd className="py-1">{route.roles.map((role) => roleLabels[role]).join(", ")}</dd>
      </dl>

      {children && <div className="mt-6 text-sm">{children}</div>}
    </section>
  );
}
