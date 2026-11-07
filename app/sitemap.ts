import type { MetadataRoute } from "next";
import { projectLibrary } from "@/data/project-library";
import { caseStudies } from "@/data/projects";
import { selectedWork, siteUrl } from "@/data/selected-work";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/book",
    "/pricing",
    "/privacy",
    "/projects",
    ...projectLibrary.map((p) => `/projects/${p.slug}`),
    ...selectedWork.map((p) => `/work/${p.slug}`),
    ...caseStudies.map((s) => `/case-studies/${s.slug}`),
  ].map((path) => ({
    url: siteUrl + path,
    lastModified: "2026-11-06",
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
