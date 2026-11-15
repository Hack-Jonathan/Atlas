/**
 * Root layout: wraps every page with the HTML shell, fonts, the dark theme
 * and the permanent RN-19 disclaimer. The area below the banner scrolls,
 * so the disclaimer is always visible.
 */
import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";

import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { siteConfig } from "@/config/site";

import "./globals.css";

/** UI and display face; the `wdth` axis gives the wide wordmark. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

/** Used only for measurements and mission data. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${archivo.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden">
        <DisclaimerBanner />
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </body>
    </html>
  );
}
