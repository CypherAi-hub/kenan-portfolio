import type { ProjectKind, TaskDefinition } from "./types";
const task = (key: string, title: string, instructions: string): TaskDefinition => ({
  key,
  title,
  instructions,
  required: true,
  assignee: "client",
});
export function checklist(kind: ProjectKind, extras: string[]): TaskDefinition[] {
  const common = [
    task(
      "contact",
      "Confirm the project contact",
      "Confirm who can answer project questions and review the work. Additional people do not gain account access through this field.",
    ),
    task(
      "requirements",
      "Confirm the agreed priorities",
      "Review the accepted proposal and note your first-release priorities or any questions. New scope still needs separate approval.",
    ),
  ];
  const specific: Record<ProjectKind, TaskDefinition[]> = {
    "Business website": [
      task(
        "brand",
        "Share your brand assets",
        "Provide an HTTPS link to your logo, brand colors, fonts and approved images. Grant access to the intended project contact.",
      ),
      task(
        "content",
        "Share approved website content",
        "Provide the agreed page copy, business details and content reference links. Note any content still being prepared.",
      ),
      task(
        "domain",
        "Arrange domain and hosting access",
        "Identify the domain owner and hosting provider, then send a delegated invitation through their service. Never paste passwords or API keys here.",
      ),
    ],
    "Web app or dashboard": [
      task(
        "roles",
        "Confirm roles and workflows",
        "Describe the agreed user roles and a typical workflow. Include only the requirements in the accepted scope.",
      ),
      task(
        "data",
        "Provide safe example data",
        "Share synthetic or appropriately redacted example data through a controlled HTTPS link. Do not include production personal data.",
      ),
      task(
        "integrations",
        "Arrange integration access",
        "Identify agreed authentication and integration systems. Use provider invitations and restricted test accounts; keep secrets out of this form.",
      ),
    ],
    "Mobile application": [
      task(
        "platforms",
        "Confirm platforms and test devices",
        "List the agreed iOS/Android platforms and devices available for testing.",
      ),
      task(
        "developer",
        "Arrange developer-account invitations",
        "Confirm who owns the Apple/Google developer accounts and arrange the necessary limited-role invitations. Do not share account passwords.",
      ),
      task(
        "backend",
        "Share app and backend references",
        "Provide approved design references, app requirements and backend documentation links. Use delegated access for services.",
      ),
    ],
    "Existing software maintenance": [
      task(
        "repository",
        "Arrange repository access",
        "Identify the repository owner and send the agreed limited-role invitation through the code hosting service.",
      ),
      task(
        "hosting",
        "Document hosting and dependencies",
        "Link to hosting documentation, dependency information and the approved support environment. Use invitations for access.",
      ),
      task(
        "history",
        "Share known issues and support history",
        "Describe known problems and provide relevant documentation links. Remove secrets and unnecessary personal data.",
      ),
    ],
  };
  return [
    ...common,
    ...specific[kind],
    ...extras.map((title, n) =>
      task(
        "scope-" + n,
        title,
        "Provide the information requested for this agreed requirement. Use notes or a controlled HTTPS sharing link.",
      ),
    ),
    {
      key: "owner-access",
      title: "Verify access and onboarding materials",
      instructions:
        "Confirm the shared materials are usable and delegated access works. Record a short verification note without credentials.",
      required: true,
      assignee: "owner",
    },
  ];
}
