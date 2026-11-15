/**
 * Layout of the flight surgeon's area (route group `(ground)`): a separate top bar,
 * not the astronaut's menu. A "Switch role" link returns to the role choice on /login.
 */
import { Repeat } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Wordmark } from "@/components/layout/wordmark";
import { routes } from "@/config/navigation";

export default function GroundLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-hairline bg-rail px-6 py-3.5 md:px-10">
        <div className="flex items-center gap-4">
          <Wordmark />
          <span className="border-l border-hairline pl-4 text-sm text-haze">Flight surgeon · Ground</span>
        </div>
        <Link
          href={routes.login.href}
          className="inline-flex items-center gap-2 text-sm text-haze [@media(hover:hover)]:hover:text-porcelain"
        >
          <Repeat aria-hidden className="size-4" />
          Switch role
        </Link>
      </header>
      <main id="main" className="min-h-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
