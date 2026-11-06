import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SmoothScroll from "@/components/effects/SmoothScroll";
import "./globals.css";
import "./studio.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kjl-designs.vercel.app"),
  title: {
    default: "KJL Designs | Websites, Apps & Digital Experiences",
    template: "%s | KJL Designs",
  },
  description:
    "Thoughtful websites, apps, and digital tools by KJL Designs, founded by Kenan Larry. Explore selected work and book a discovery call for your next project.",
  openGraph: {
    title: "KJL Designs | Websites, Apps & Digital Experiences",
    description:
      "Websites, apps, and useful digital experiences. Explore recent work and book a call with Kenan Larry.",
    type: "website",
    url: "https://kjl-designs.vercel.app",
    siteName: "KJL Designs",
  },
  twitter: {
    card: "summary_large_image",
    title: "KJL Designs | Websites, Apps & Digital Experiences",
    description: "Websites, apps, and digital tools. Built around people.",
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
