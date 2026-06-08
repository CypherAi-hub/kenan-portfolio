import type { Metadata } from "next";
import KenanWorld from "@/components/KenanWorld";

export const metadata: Metadata = {
  title: "Kenan World",
  description:
    "An explorable interactive portfolio world for Kenan Larry, mapping projects, cybersecurity work, AI tools, experience, and certifications into a playable proof system.",
};

export default function WorldPage() {
  return <KenanWorld />;
}
