import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/portal", "/studio", "/api/"] },
    sitemap: "https://kjl-designs.vercel.app/sitemap.xml",
  };
}
