"use client";
import { motion } from "motion/react";
import { profile } from "@/lib/data";
import { writeupReveal, viewport } from "@/lib/motion";

const meta = [
  ["LOCATION", profile.location],
  ["EDUCATION", profile.education],
  ["CURRENTLY", profile.currently],
  ["OPEN TO", profile.openTo],
];

export default function About() {
  return (
    <div className="mt-16 grid gap-12 lg:grid-cols-12">
      <dl className="space-y-5 font-mono text-xs lg:col-span-4">
        {meta.map(([k, v], i) => (
          <motion.div
            key={k}
            custom={i}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={writeupReveal}
          >
            <dt className="uppercase tracking-[0.14em] text-fg-muted">{k}</dt>
            <dd className="mt-1 text-fg">{v}</dd>
          </motion.div>
        ))}
      </dl>
      <div className="max-w-[62ch] space-y-5 leading-[1.7] text-fg-secondary lg:col-span-8">
        <motion.p
          custom={0}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={writeupReveal}
        >
          I&rsquo;m a Cybersecurity &amp; AI student at Maryville University in St. Louis. I started
          shipping software because waiting for permission to build felt like the slowest way to
          learn. FoFit, my AI fitness coach, was the first thing I shipped end-to-end and put in
          front of real users.
        </motion.p>
        <motion.p
          custom={1}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={writeupReveal}
        >
          On the security side, I work as a student consultant at Maryville Business Solutions
          running pen tests and phishing simulations on local engagements. The other half of my time
          goes to Cypher OS &mdash; a sovereign, local-first AI command system I&rsquo;m
          architecting around 30+ specialized agents across 8 departments.
        </motion.p>
        <motion.p
          custom={2}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={writeupReveal}
        >
          I move fast, write production code, and care more about shipping than credentials. If
          you&rsquo;re building at the intersection of security, AI, and systems &mdash; let&rsquo;s
          talk.
        </motion.p>
      </div>
    </div>
  );
}
