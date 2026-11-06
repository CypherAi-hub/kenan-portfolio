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
    "Explore Kenan Larry’s websites, mobile apps, research tools, AI experiments, and security projects. Search the full project collection.",
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
            A curious mind.
            <br />
            <em>A lot of builds.</em>
          </h1>
          <p>
            Websites for real people. Apps I’m bringing to life. Experiments that taught me
            something new. Explore the work, from the first prototypes to what I’m building now.
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
