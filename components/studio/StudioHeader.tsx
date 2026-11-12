"use client";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import styles from "./StudioHeader.module.css";
export default function StudioHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className={`studio-header ${styles.header}`}>
      <div className="studio-shell nav-row">
        <Link href="/" className="studio-brand" aria-label="KJL Designs home">
          <BrandLogo />
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          <Link href="/#work">Selected work</Link>
          <Link href="/projects">All projects</Link>
          <Link href="/#services">Services</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/#about">About</Link>
          <Link href="/portal/login">Client login</Link>
        </nav>
        <Link className="studio-button button-small" href="/start-project">
          Start a project <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          className="mobile-nav studio-shell"
          id="mobile-navigation"
          aria-label="Mobile navigation"
        >
          {[
            ["Selected work", "/#work"],
            ["All projects", "/projects"],
            ["Services", "/#services"],
            ["Pricing", "/pricing"],
            ["About", "/#about"],
            ["Client login", "/portal/login"],
            ["Start a project", "/start-project"],
            ["Book with me", "/#book"],
          ].map(([name, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {name}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
