"use client";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
export default function SiteMetrics() {
  const path = usePathname();
  if (path === "/portal") return null;
  return (
    <>
      <Analytics
        beforeSend={(event) =>
          new URL(event.url, location.origin).pathname === "/portal" ? null : event
        }
      />
      <SpeedInsights />
    </>
  );
}
