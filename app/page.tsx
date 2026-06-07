import CaseStudySection from "@/components/CaseStudySection";
import ContactSection from "@/components/ContactSection";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import FeaturedBuilds from "@/components/FeaturedBuilds";
import Footer from "@/components/Footer";
import FoFitEcosystem from "@/components/FoFitEcosystem";
import Hero from "@/components/Hero";
import ProjectArchive from "@/components/ProjectArchive";
import ProjectCategoryShowcase from "@/components/ProjectCategoryShowcase";
import ProofBar from "@/components/ProofBar";
import ResumeCTA from "@/components/ResumeCTA";
import SectionHeader from "@/components/SectionHeader";
import SecurityReportSection from "@/components/SecurityReportSection";
import SkillsGrid from "@/components/SkillsGrid";

export default function Home() {
  return (
    <>
      <Hero />
      <ProofBar />
      <main className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <FeaturedBuilds />
        <FoFitEcosystem />
        <ProjectCategoryShowcase />
        <SecurityReportSection />
        <section id="archive" className="section-shell py-20">
          <SectionHeader eyebrow="All Builds / Repository Archive" title="Complete body of work.">
            Every listed GitHub repository is included with status, category, stack, tags, and a
            GitHub link. Search and filters make it fast to scan.
          </SectionHeader>
          <ProjectArchive />
        </section>
        <CaseStudySection />
        <ExperienceTimeline />
        <SkillsGrid />
        <ResumeCTA />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}
