import type { Project, ProjectStatus } from "@/data/projects";

export type { Project, ProjectStatus };
export {
  caseStudies,
  featuredProjects,
  foFitProjects,
  projectCategories,
  projects,
} from "@/data/projects";

export const profile = {
  name: "Kenan Larry",
  headline: "Cybersecurity & AI Student Building Applied AI Products",
  intro:
    "I build full-stack AI, fitness-tech, cloud, and cybersecurity projects with a focus on real users, product execution, and technical problem-solving.",
  status: "Seeking Summer 2027 Technology / Cybersecurity / AI Internships",
  location: "St. Louis, MO",
  education: "Cybersecurity & AI student at Maryville University",
  currently: "Building FoFit, FoFit Coach, and applied AI/cybersecurity projects",
  openTo: "Summer 2027 Technology / Cybersecurity / AI internships",
  email: "kenanlarry8@gmail.com",
  github: "https://github.com/CypherAi-hub",
  linkedin: "https://www.linkedin.com/in/kenan-larry-993350332",
  linkedinLabel: "in/kenan-larry-993350332",
  resumeUrl: "/resume.pdf",
  copyright: `© ${new Date().getFullYear()} Kenan Larry. Built in St. Louis.`,
};

export const proofPoints = [
  "Cybersecurity & AI Major",
  "Founder/Builder of FoFit",
  "React Native / Supabase / OpenAI API",
  "AWS / Cloud Projects",
  "Cybersecurity Projects",
  "Google Cybersecurity Certificate",
  "AI Agent Tools",
  "St. Louis, MO",
];

export const experiences = [
  {
    role: "Student Consultant",
    org: "Maryville Business Solutions",
    summary:
      "Consulting experience across technical problem-solving, client communication, security fundamentals, and business-facing delivery.",
  },
  {
    role: "Technology Support Assistant",
    org: "IST Management Services",
    summary:
      "Hands-on support work focused on reliability, troubleshooting, user assistance, and operational follow-through.",
  },
  {
    role: "AI Training Specialist",
    org: "Outlier AI",
    summary:
      "Evaluation and feedback work for AI-generated outputs, prompt quality, reasoning consistency, and model behavior.",
  },
  {
    role: "Vehicle Prep / Operations",
    org: "CarMax",
    summary:
      "Operations role framed around quality standards, consistency, process discipline, and work ethic.",
  },
];

export const skillGroups = [
  {
    label: "AI Product Engineering",
    skills: ["OpenAI API", "LLM evaluation", "Prompt engineering", "AI product workflows"],
  },
  {
    label: "Cybersecurity",
    skills: [
      "Risk assessment",
      "Phishing simulations",
      "Penetration testing basics",
      "Networking fundamentals",
      "SIEM basics",
    ],
  },
  {
    label: "Cloud / DevOps",
    skills: ["AWS S3", "AWS Rekognition", "Vercel", "Cloud project workflows", "GitHub"],
  },
  {
    label: "Frontend / Mobile",
    skills: ["React", "Next.js", "React Native", "Expo", "Tailwind CSS"],
  },
  {
    label: "Backend / Data",
    skills: ["Supabase", "PostgreSQL basics", "Authentication", "APIs", "TypeScript"],
  },
  {
    label: "Tools",
    skills: ["Python", "JavaScript", "VS Code", "Git", "GitHub", "Vercel"],
  },
];

export const certifications = [
  {
    name: "Google Cybersecurity Professional Certificate",
    status: "Completed",
    detail: "Completed August 16, 2025",
    media: "/media/projects/certifications/google-cybersecurity-certificate.webp",
  },
  {
    name: "CompTIA Security+",
    status: "In Progress",
    detail: "Expected September 2026",
  },
];

export const certification = certifications[1];
