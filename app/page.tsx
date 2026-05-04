import Hero from "@/components/Hero";
import SectionMarker from "@/components/SectionMarker";
import ProjectCard from "@/components/ProjectCard";
import SecurityWriteups from "@/components/SecurityWriteups";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { projects } from "@/lib/data";

export default function Home() {
  return (
    <main className="mx-auto max-w-[1200px] px-6 lg:px-12">
      <Hero />
      <section id="work" className="py-32">
        <SectionMarker number="01" label="selected work" />
        <div className="mt-16 grid gap-8">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </section>
      <section id="writeups" className="py-32">
        <SectionMarker number="02" label="security writeups" />
        <SecurityWriteups />
      </section>
      <section id="about" className="py-32">
        <SectionMarker number="03" label="about" />
        <About />
      </section>
      <section id="contact" className="py-32">
        <SectionMarker number="04" label="contact" />
        <Contact />
      </section>
      <Footer />
    </main>
  );
}
