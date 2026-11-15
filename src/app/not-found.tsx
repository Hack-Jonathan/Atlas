/**
 * 404 page. The RN-19 disclaimer still shows because it lives in the root layout.
 */
import Link from "next/link";

import { routes } from "@/config/navigation";

export default function NotFound() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="font-mono text-sm text-haze tabular-nums">404</p>
      <h1 className="text-4xl font-extrabold tracking-tight">Off the flight plan</h1>
      <p className="text-haze">This page does not exist.</p>
      <Link
        href={routes.home.href}
        className="mt-2 rounded-lg border border-hairline px-4 py-2 font-medium transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
      >
        Back to home
      </Link>
    </main>
  );
}
