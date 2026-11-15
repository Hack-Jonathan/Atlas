/**
 * "/" — Public presentation of Atlas (module M01).
 * The wordmark rises over the Earth limb; one sentence says what Atlas is; one action.
 */
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { EarthLimb } from "@/components/status/earth-limb";
import { Wordmark } from "@/components/layout/wordmark";
import { routes } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="relative isolate flex min-h-full flex-col items-center justify-center overflow-hidden px-6 pt-16 pb-56 text-center">
      <div className="absolute inset-x-0 bottom-0 -z-10 h-64 md:h-80">
        <EarthLimb level="unknown" />
      </div>

      <Wordmark size="hero" />
      <p className="mt-6 max-w-xl text-lg text-haze md:text-xl">{siteConfig.tagline}.</p>
      <Link
        href={routes.login.href}
        className="mt-10 inline-flex items-center gap-2 rounded-lg bg-action px-5 py-3 font-semibold text-action-foreground transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
      >
        {routes.login.label}
        <ArrowRight aria-hidden className="size-4" />
      </Link>
      <p className="mt-16 text-sm text-haze">{siteConfig.challenge}</p>
    </main>
  );
}
