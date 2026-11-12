import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
import ProjectIntake from "@/components/intake/ProjectIntake";
import "./intake.css";
export const metadata = {
  title: "Start your project",
  description:
    "Tell KJL Designs about your website, app, or workflow. Thoughtful questions and a clear starting point for your project.",
  referrer: "no-referrer" as const,
};
export default function StartProject() {
  return (
    <div className="studio">
      <a className="studio-skip" href="#main">
        Skip to project discovery
      </a>
      <StudioHeader />
      <main id="main" className="studio-shell intake-shell">
        <ProjectIntake />
      </main>
      <StudioFooter />
    </div>
  );
}
