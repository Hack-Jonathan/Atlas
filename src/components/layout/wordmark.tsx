/**
 * The ATLAS wordmark: wide Archivo, tracked out, linking home.
 * `size` switches between the rail version and the large landing version.
 */
import Link from "next/link";

import { routes } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  size?: "rail" | "hero";
  className?: string;
}

export function Wordmark({ size = "rail", className }: WordmarkProps) {
  return (
    <Link
      href={routes.home.href}
      aria-label={`${siteConfig.name} home`}
      className={cn(
        "font-heading font-extrabold uppercase [font-stretch:125%]",
        size === "rail" ? "text-lg tracking-[0.32em]" : "text-6xl tracking-[0.28em] md:text-8xl",
        className,
      )}
    >
      {siteConfig.name}
    </Link>
  );
}
