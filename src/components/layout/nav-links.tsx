"use client";

/**
 * The astronaut's four main links (from `crewNavItems`).
 * - `NavLinks` only draws the links; `pathname = null` draws them with no active item.
 * - `ActiveNavLinks` reads the current URL to highlight the active item. URL data is
 *   runtime-only under Cache Components, so it must be rendered inside <Suspense>.
 * Active state = filled background + bright icon + aria-current, never color alone.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

import { crewNavItems, isActivePath } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {crewNavItems.map((item) => {
        const active = pathname !== null && isActivePath(item.href, pathname);
        const Icon = item.icon;
        return (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base text-haze transition-colors duration-150 ease-out",
                "[@media(hover:hover)]:hover:bg-space-raised [@media(hover:hover)]:hover:text-porcelain",
                active && "bg-space-raised font-semibold text-porcelain",
              )}
            >
              <Icon aria-hidden className={cn("size-[18px]", active && "text-action")} />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}
