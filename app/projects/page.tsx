import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
import ProjectLibrary from "@/components/studio/ProjectLibrary";
import { projectLibrary } from "@/data/project-library";
import { siteUrl } from "@/data/selected-work";
export const metadata: Metadata = {
  title: "All Projects",
  description:
    "Explore the KJL Designs project collection by Kenan Larry: websites, mobile apps, research tools, AI experiments, and security projects. Search the full project collection.",
  alternates: { canonical: `${siteUrl}/projects` },
};
export default function Projects() {
  return (
    <div className="studio">
      <a className="studio-skip" href="#main">
        Skip to content
      </a>
      <StudioHeader />
      <main className="studio-shell" id="main">
        <header className="archive-intro library-intro">
          <p className="eyebrow">THE FULL COLLECTION / {projectLibrary.length} PROJECTS</p>
          <h1>
            The complete
            <br />
            body of work.
          </h1>
          <p>
            Explore client websites, independent products, and research projects. Each entry
            includes the purpose, current stage, and a closer look at the build.
          </p>
          <Link className="text-link" style={{ marginTop: 24 }} href="/book">
            Have your own idea? Let’s talk <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </header>
        <ProjectLibrary />
        <div className="library-footnote">
          Each entry shows its stage: a live website, a development build, a prototype, or an
          archived experiment. Screenshots are snapshots of the work at the time they were captured.
        </div>
      </main>
      <StudioFooter />
    </div>
  );
}
