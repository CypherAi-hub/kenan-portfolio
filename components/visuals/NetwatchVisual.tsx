"use client";
import { motion } from "motion/react";

const LOGS = [
  { t: "12:04:11", k: "TCP", msg: "443 → 10.0.1.4 :: ALLOW", c: "text-fg-secondary" },
  { t: "12:04:12", k: "DNS", msg: "lookup: api.fofit.app :: OK", c: "text-fg-secondary" },
  { t: "12:04:14", k: "ALERT", msg: "anomaly score 0.87 on host-7", c: "text-status-active" },
  {
    t: "12:04:15",
    k: "TCP",
    msg: "22 → 10.0.1.9 :: DENY policy=ssh-block",
    c: "text-status-error",
  },
  { t: "12:04:17", k: "TCP", msg: "443 → 10.0.1.4 :: ALLOW", c: "text-fg-secondary" },
  { t: "12:04:19", k: "INFO", msg: "rotating session keys :: OK", c: "text-fg-secondary" },
  { t: "12:04:21", k: "ALERT", msg: "egress spike 480MB/s on if-eth0", c: "text-status-active" },
  { t: "12:04:23", k: "TCP", msg: "443 → 10.0.1.4 :: ALLOW", c: "text-fg-secondary" },
];

export default function NetwatchVisual() {
  return (
    <div className="bg-bg absolute inset-0 overflow-hidden p-4 font-mono text-[10px]">
      <div className="text-fg-muted">netwatch · live · tap=eth0</div>
      <div className="mt-2 space-y-1">
        {LOGS.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
            className="tabular flex gap-2"
          >
            <span className="text-fg-dimmed">{l.t}</span>
            <span
              className={`uppercase ${
                l.k === "ALERT"
                  ? "text-status-active"
                  : l.k === "DENY"
                    ? "text-status-error"
                    : "text-cyan"
              }`}
            >
              {l.k}
            </span>
            <span className={l.c}>{l.msg}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
