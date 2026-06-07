import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SmoothScroll from "@/components/effects/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kenanlarry.dev"),
  title: { default: "Kenan Larry | Cybersecurity & AI Student", template: "%s | Kenan Larry" },
  description:
    "Portfolio of Kenan Larry, a Cybersecurity & AI student building applied AI, fitness-tech, cloud, and cybersecurity projects.",
  openGraph: {
    title: "Kenan Larry | Cybersecurity & AI Student",
    description:
      "Applied AI, fitness-tech, cloud, cybersecurity, and business-facing software projects by Kenan Larry.",
    type: "website",
    url: "https://kenanlarry.dev",
    siteName: "Kenan Larry Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kenan Larry | Cybersecurity & AI Student",
    description: "Applied AI, cloud, cybersecurity, and product builds.",
  },
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
