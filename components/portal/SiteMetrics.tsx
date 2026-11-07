"use client";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
export default function SiteMetrics() {
  const path = usePathname();
  if (/^\/(portal|studio)(\/|$)/.test(path)) return null;
  return (
    <>
      <Analytics
        beforeSend={(event) =>
          /^\/(portal|studio)(\/|$)/.test(new URL(event.url, location.origin).pathname)
            ? null
            : event
        }
      />
      <SpeedInsights />
    </>
  );
}
