import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SmoothScroll from "@/components/effects/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kenanlarry.dev"),
  title: { default: "Kenan Larry — Cybersecurity & AI · Builder", template: "%s · Kenan Larry" },
  description:
    "Cybersecurity & AI student at Maryville University. Founder of FoFit. Architecting Cypher OS. Based in St. Louis.",
  openGraph: {
    title: "Kenan Larry",
    description: "Cybersecurity & AI · Builder · St. Louis",
    type: "website",
    url: "https://kenanlarry.dev",
  },
  twitter: { card: "summary_large_image", creator: "@cypher_ai" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-bg text-fg antialiased">
        <SmoothScroll>{children}</SmoothScroll>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
