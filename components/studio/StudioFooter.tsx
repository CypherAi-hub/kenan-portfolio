import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/lib/data";
export default function StudioFooter() {
  return (
    <footer className="studio-footer studio-shell">
      <div className="footer-top">
        <Link href="/" className="footer-name">
          Kenan Larry<span aria-hidden="true">✳</span>
        </Link>
        <p>
          Thoughtful design.
          <br />
          Useful things, built well.
        </p>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Kenan Larry · St. Louis, Missouri</span>
        <nav aria-label="Footer navigation">
          <Link href="/projects">All projects</Link>
          <Link href="/world">Kenan World</Link>
          <a href={profile.linkedin}>
            LinkedIn <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <a href={profile.github}>
            GitHub <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
