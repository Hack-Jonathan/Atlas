/**
 * "/login" — Access (module M01). Stage 1 has no authentication yet, so the page
 * offers the two roles directly: astronaut → crew dashboard, flight surgeon → ground console.
 * The Earth limb (neutral state) keeps the role choice inside the Atlas world.
 */
import { ArrowRight, Rocket, Stethoscope } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Wordmark } from "@/components/layout/wordmark";
import { EarthLimb } from "@/components/status/earth-limb";
import { routes } from "@/config/navigation";

export const metadata: Metadata = { title: routes.login.label };

const roleChoices = [
  {
    href: routes.dashboard.href,
    title: "Astronaut",
    description: "Daily check-up, your status and messages to Earth.",
    icon: Rocket,
  },
  {
    href: routes.ground.href,
    title: "Flight surgeon",
    description: "Ground console with the crew's delayed reports.",
    icon: Stethoscope,
  },
];

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-full flex-col justify-center overflow-hidden px-6 pt-16 pb-48">
      <div className="absolute inset-x-0 bottom-0 -z-10 h-56 md:h-72">
        <EarthLimb level="unknown" />
      </div>
      <div className="mx-auto w-full max-w-2xl">
        <Wordmark />
        <h1 className="mt-10 text-4xl font-extrabold tracking-tight">Who is signing in?</h1>
        <p className="mt-3 text-haze">Sign-in with accounts arrives in a later stage. For now, choose a role.</p>

        <ul className="mt-8 border-y border-hairline">
          {roleChoices.map((choice) => {
            const Icon = choice.icon;
            return (
              <li key={choice.href} className="not-last:border-b not-last:border-hairline">
                <Link
                  href={choice.href}
                  className="group flex items-center gap-5 py-5 transition-colors duration-150 [@media(hover:hover)]:hover:bg-space-raised/50"
                >
                  <Icon aria-hidden className="size-7 shrink-0 text-action" />
                  <span className="flex-1">
                    <span className="block text-xl font-bold">{choice.title}</span>
                    <span className="block text-sm text-haze">{choice.description}</span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-5 text-haze transition-transform duration-150 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:translate-x-1"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
