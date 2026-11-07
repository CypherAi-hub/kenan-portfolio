import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/lib/data";
export default function StudioFooter() {
  return (
    <footer className="studio-footer studio-shell">
      <div className="footer-top">
        <Link href="/" className="footer-name" aria-label="KJL Designs home">
          <BrandLogo footer />
        </Link>
        <p>
          Thoughtful design.
          <br />
          Useful things, built well.
        </p>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} KJL Designs · St. Louis, Missouri</span>
        <nav aria-label="Footer navigation">
          <Link href="/projects">All projects</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/portal/login">Client workspace</Link>
          <Link href="/studio/login">Studio login</Link>
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
