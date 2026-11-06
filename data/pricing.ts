export type PriceRange = readonly [number, number];
export const packages = [
  {
    id: "launch",
    name: "Launch website",
    label: "A focused first impression",
    range: [750, 1500] as PriceRange,
    description:
      "For a personal brand, a new offer, or a business that needs a clear place to start.",
    includes: [
      "One custom page with clear sections",
      "Mobile and desktop layouts",
      "Contact links or a simple inquiry form",
      "Page titles and search basics",
      "One round of revisions + launch handoff",
    ],
  },
  {
    id: "business",
    name: "Business website",
    label: "Room for your business to grow",
    range: [1800, 3500] as PriceRange,
    description:
      "For a service business that needs a polished site, a stronger story, and a simple way to turn interest into inquiries.",
    includes: [
      "Up to five custom pages",
      "Mobile and desktop layouts",
      "Contact form + existing booking integration",
      "Page titles and search basics",
      "Two rounds of revisions + launch handoff",
    ],
  },
  {
    id: "web-app",
    name: "Custom web app",
    label: "A workflow built around you",
    range: [4000, 9000] as PriceRange,
    description:
      "For a focused portal, dashboard, or internal tool that makes one important workflow easier.",
    includes: [
      "Discovery and a defined first-version scope",
      "Custom interface and core workflow",
      "User accounts when the scope needs them",
      "Agreed data and integration setup",
      "Testing, walkthrough, and handoff",
    ],
  },
  {
    id: "mobile",
    name: "Mobile app prototype",
    label: "Bring the app idea into focus",
    range: [6000, 12000] as PriceRange,
    description: "For a focused mobile experience you can test, demonstrate, and build on.",
    includes: [
      "Defined prototype scope and user journey",
      "Custom mobile interface and navigation",
      "Core screens and agreed interactions",
      "Development build for review",
      "Testing and a next-stage roadmap",
    ],
  },
] as const;
export type PackageId = (typeof packages)[number]["id"];
export const extras: {
  id: string;
  name: string;
  description: string;
  range: PriceRange;
  for: PackageId[];
}[] = [
  {
    id: "booking",
    name: "Booking integration",
    description: "Connect an existing scheduling service to your one-page site.",
    range: [150, 350],
    for: ["launch"],
  },
  {
    id: "content",
    name: "Content organization & editing",
    description: "Help shape your supplied notes and content into clear page copy.",
    range: [250, 750],
    for: ["launch", "business"],
  },
  {
    id: "cms",
    name: "Editable content setup",
    description: "A simple content system for the pages or posts you need to update.",
    range: [400, 900],
    for: ["launch", "business"],
  },
  {
    id: "automation",
    name: "Connected workflow",
    description: "A scoped form-to-tool integration or simple business automation.",
    range: [500, 1500],
    for: ["business"],
  },
  {
    id: "payments",
    name: "Payment integration",
    description: "A scoped checkout or subscription flow using your payment-provider account.",
    range: [750, 1800],
    for: ["web-app", "mobile"],
  },
  {
    id: "ai",
    name: "AI-assisted feature",
    description: "One defined AI workflow with clear limits, review, and usage controls.",
    range: [1000, 2500],
    for: ["web-app", "mobile"],
  },
];
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
export function calculateEstimate(packageId: PackageId, extraIds: string[], extraPages: number) {
  const base = packages.find((p) => p.id === packageId)!;
  const options = extras.filter((e) => e.for.includes(packageId) && extraIds.includes(e.id));
  const pages =
    packageId === "business" ? Math.max(0, Math.min(5, Math.trunc(extraPages) || 0)) : 0;
  const min = base.range[0] + options.reduce((n, e) => n + e.range[0], 0) + pages * 150;
  const max = base.range[1] + options.reduce((n, e) => n + e.range[1], 0) + pages * 300;
  return { base, options, pages, min, max };
}
