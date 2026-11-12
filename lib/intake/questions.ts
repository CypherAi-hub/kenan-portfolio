export type Answers = Record<string, string | string[]>;
export type Question = {
  id: string;
  label: string;
  hint?: string;
  type?: "text" | "email" | "textarea" | "choice" | "multi";
  options?: string[];
  required?: boolean;
  when?: (answers: Answers) => boolean;
};
export const unsure = "Not sure yet";
const feature = (name: string) => (a: Answers) =>
  Array.isArray(a.features) && a.features.includes(name);
const kind =
  (...names: string[]) =>
  (a: Answers) =>
    names.includes(String(a.kind));
export const sections: { id: string; title: string; description: string; questions: Question[] }[] =
  [
    {
      id: "idea",
      title: "The big picture",
      description: "Start with the idea. You don’t need a technical plan to have a good one.",
      questions: [
        {
          id: "work",
          label: "What kind of help do you need?",
          type: "choice",
          required: true,
          options: [
            "A new build",
            "Improve an existing product",
            "Fix a problem",
            "Ongoing support",
          ],
        },
        {
          id: "kind",
          label: "What are we working on?",
          type: "choice",
          required: true,
          options: [
            "Business website",
            "Web application",
            "Mobile app",
            "Internal tool or dashboard",
            "Online store",
            "Workflow automation",
            unsure,
          ],
        },
        {
          id: "organization",
          label: "Tell me about your business or team.",
          hint: "What do you do, and who do you serve?",
        },
        {
          id: "idea",
          label: "Describe your project in your own words.",
          hint: "What’s the problem, and what would you like to build or change?",
          type: "textarea",
          required: true,
        },
        { id: "currentProcess", label: "How do you handle this today?", type: "textarea" },
        {
          id: "success",
          label: "What would make this project a success?",
          hint: "For example: fewer manual tasks, more bookings, or a smoother customer experience.",
          type: "textarea",
          required: true,
        },
        {
          id: "existing",
          label: "What’s already in place, and what needs to change?",
          hint: "Include a public website link if you have one. For a bug, describe what happens and what you expected.",
          type: "textarea",
          when: (a) => !!a.work && a.work !== "A new build",
        },
      ],
    },
    {
      id: "people",
      title: "People & their journey",
      description: "Let’s understand who this is for and what they need to get done.",
      questions: [
        {
          id: "audience",
          label: "Who will use it?",
          type: "multi",
          required: true,
          options: [
            "Customers or the public",
            "Employees",
            "Administrators",
            "Partners or vendors",
            unsure,
          ],
        },
        {
          id: "volume",
          label: "How many people do you expect to use it?",
          type: "choice",
          options: ["Under 50", "50–500", "500–5,000", "More than 5,000", unsure],
        },
        {
          id: "journey",
          label: "Walk me through the most important task.",
          hint: "What does someone do first, what happens next, and how do they know they’re finished?",
          type: "textarea",
          required: true,
        },
        {
          id: "roles",
          label: "Should different people see or do different things?",
          hint: "For example: customers submit requests; staff update them; managers approve them.",
          type: "textarea",
        },
        {
          id: "exceptions",
          label: "What should happen when something goes wrong?",
          hint: "Think about cancellations, mistakes, incomplete requests, or unavailable services.",
          type: "textarea",
        },
        {
          id: "accessibility",
          label: "Any device, language, or accessibility needs?",
          type: "textarea",
        },
      ],
    },
    {
      id: "scope",
      title: "What it needs to do",
      description: "Separate the essentials from the ideas that can grow with you.",
      questions: [
        {
          id: "features",
          label: "Which features do you have in mind?",
          hint: "Choose all that apply. We’ll ask the relevant details next.",
          type: "multi",
          options: [
            "User accounts",
            "Admin dashboard",
            "Payments",
            "Booking",
            "Notifications",
            "File uploads",
            "AI functionality",
            "Integrations",
            "Reports",
            unsure,
          ],
        },
        {
          id: "mustHave",
          label: "What absolutely needs to be in the first version?",
          type: "textarea",
          required: true,
        },
        { id: "later", label: "What could wait until a later version?", type: "textarea" },
        {
          id: "excluded",
          label: "Anything you specifically don’t want included?",
          type: "textarea",
        },
        {
          id: "preserve",
          label: "What must keep working during the change?",
          type: "textarea",
          when: (a) => !!a.work && a.work !== "A new build",
        },
      ],
    },
    {
      id: "details",
      title: "A closer look",
      description: "A few specifics about the project and features you selected.",
      questions: [
        {
          id: "pages",
          label: "Which pages or sections do you need?",
          hint: "Who will update the content after launch?",
          type: "textarea",
          when: kind("Business website", "Online store"),
        },
        {
          id: "mobile",
          label: "What does the mobile app need access to?",
          hint: "iPhone, Android, or both? Camera, location, push notifications, or offline use? Do you have store accounts?",
          type: "textarea",
          when: kind("Mobile app"),
        },
        {
          id: "operations",
          label: "How should work move through the system?",
          hint: "Statuses, assignments, approval steps, and who can change each one.",
          type: "textarea",
          when: (a) => kind("Internal tool or dashboard")(a) || feature("Admin dashboard")(a),
        },
        {
          id: "automation",
          label: "What starts the automation, and what should it produce?",
          hint: "Describe the input, destination, frequency, human approvals, and how failures should be handled.",
          type: "textarea",
          when: kind("Workflow automation"),
        },
        {
          id: "catalog",
          label: "What will you sell, and how will you deliver it?",
          hint: "Products or services, approximate catalog size, inventory, shipping, or digital delivery.",
          type: "textarea",
          when: kind("Online store"),
        },
        {
          id: "accounts",
          label: "How should people get access?",
          hint: "Public sign-up or invitations? Existing Google, Microsoft, or organization login? How are accounts removed?",
          type: "textarea",
          when: feature("User accounts"),
        },
        {
          id: "payments",
          label: "How should payments work?",
          hint: "Who pays whom? One-time or subscriptions? Existing payment provider? Who handles refunds and receipts?",
          type: "textarea",
          when: (a) => feature("Payments")(a) || kind("Online store")(a),
        },
        {
          id: "booking",
          label: "What can people book, and what are the rules?",
          hint: "Availability, time zones, capacity, cancellations, reminders, and calendar connections.",
          type: "textarea",
          when: feature("Booking"),
        },
        {
          id: "notifications",
          label: "Who needs to hear about which events?",
          hint: "Email, text, push, or in-app updates? Should users control what they receive?",
          type: "textarea",
          when: feature("Notifications"),
        },
        {
          id: "uploads",
          label: "What files will people upload, and who can view them?",
          hint: "File types, approximate sizes, retention, and any confidential content. Please describe only; don’t send private records.",
          type: "textarea",
          when: feature("File uploads"),
        },
        {
          id: "ai",
          label: "What should AI help with?",
          hint: "What information can it use? What should its output look like? Who checks it, and what happens if it is wrong?",
          type: "textarea",
          when: feature("AI functionality"),
        },
        {
          id: "integrations",
          label: "Which systems need to connect?",
          hint: "Name each service, what information moves between them, and who manages access. Don’t include credentials.",
          type: "textarea",
          when: feature("Integrations"),
        },
        {
          id: "reports",
          label: "Which reports or numbers matter?",
          hint: "Who sees them, how often, and whether exports are needed.",
          type: "textarea",
          when: feature("Reports"),
        },
      ],
    },
    {
      id: "design",
      title: "Look, feel & information",
      description: "Help me understand the experience you want and the information it needs.",
      questions: [
        {
          id: "brand",
          label: "Do you have a logo, colors, designs, or brand guidelines?",
          type: "textarea",
        },
        {
          id: "references",
          label: "Any websites, apps, or reference documents you’d like me to see?",
          hint: "Paste links and explain what you like. Use share links you’re comfortable giving Kenan; don’t include access tokens.",
          type: "textarea",
        },
        {
          id: "content",
          label: "Who will provide the text, images, and other content?",
          type: "textarea",
        },
        {
          id: "data",
          label: "What information will the system store?",
          hint: "Describe categories of information, who can access them, and whether existing data needs to be moved.",
          type: "textarea",
        },
        {
          id: "constraints",
          label: "Any hosting, privacy, security, or organizational requirements?",
          hint: "For example: required vendors, data deletion rules, an IT review, or existing company systems.",
          type: "textarea",
        },
      ],
    },
    {
      id: "delivery",
      title: "Making it happen",
      description:
        "A little context for planning the work together. These answers aren’t a commitment.",
      questions: [
        {
          id: "budget",
          label: "What budget are you planning?",
          type: "choice",
          options: [
            "Under $500",
            "$500–$1,500",
            "$1,500–$5,000",
            "$5,000–$10,000",
            "$10,000+",
            unsure,
          ],
        },
        {
          id: "deadline",
          label: "When would you like to launch?",
          hint: "If there’s a fixed date, what’s driving it?",
          type: "textarea",
        },
        {
          id: "decision",
          label: "Who gives final approval?",
          hint: "Include other stakeholders, procurement, or review steps if relevant.",
          type: "textarea",
        },
        {
          id: "ownership",
          label: "Who manages your domain, hosting, and software accounts?",
          type: "textarea",
        },
        {
          id: "maintenance",
          label: "What support would you like after launch?",
          type: "choice",
          options: ["Handoff and training", "Occasional help", "Ongoing maintenance", unsure],
        },
        { id: "anything", label: "Anything else I should know?", type: "textarea" },
      ],
    },
    {
      id: "contact",
      title: "Let’s stay in touch",
      description: "Your inquiry goes to Kenan’s private studio. No account is needed.",
      questions: [
        { id: "name", label: "Your name", type: "text", required: true },
        { id: "email", label: "Email address", type: "email", required: true },
        {
          id: "contactPreference",
          label: "How would you prefer to discuss the project?",
          type: "choice",
          options: ["Email first", "A discovery call", "Either works"],
        },
      ],
    },
  ];
export const visibleQuestions = (answers: Answers) =>
  sections.flatMap((s) => s.questions).filter((q) => !q.when || q.when(answers));
export function cleanAnswers(input: unknown): Answers {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Check your project answers.");
  const raw = input as Record<string, unknown>;
  const answers: Answers = {};
  for (const q of sections.flatMap((s) => s.questions)) {
    const value = raw[q.id];
    if (value === undefined || value === "") continue;
    if (q.type === "multi") {
      if (
        !Array.isArray(value) ||
        value.length > (q.options?.length || 0) ||
        value.some((v) => typeof v !== "string" || !q.options?.includes(v))
      )
        throw new Error(`Check “${q.label}”`);
      if (value.includes(unsure) && value.length > 1)
        throw new Error(`Choose either “${unsure}” or specific options.`);
      answers[q.id] = [...new Set(value)];
    } else {
      if (
        typeof value !== "string" ||
        value.length > (q.type === "text" || q.type === "email" ? 200 : 2000)
      )
        throw new Error(
          `Check “${q.label}” (maximum ${q.type === "text" || q.type === "email" ? 200 : 2000} characters).`,
        );
      if (q.options && !q.options.includes(value)) throw new Error(`Check “${q.label}”`);
      answers[q.id] = value.trim();
    }
  }
  const active = new Set(visibleQuestions(answers).map((q) => q.id));
  return Object.fromEntries(Object.entries(answers).filter(([id]) => active.has(id)));
}
export function missingAnswers(answers: Answers) {
  return visibleQuestions(answers).filter(
    (q) => q.required && (!answers[q.id] || answers[q.id].length === 0),
  );
}
export function validateAnswers(input: unknown): Answers {
  const answers = cleanAnswers(input);
  const missing = missingAnswers(answers);
  if (missing.length) throw new Error(`Please answer: ${missing[0].label}`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(answers.email)))
    throw new Error("Enter a valid email address.");
  return answers;
}
export const answerText = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value.join(", ") : value || "Not supplied";
export function sourceRows(answers: Answers, includeContact = false) {
  return visibleQuestions(answers)
    .filter((q) => includeContact || !["name", "email", "contactPreference"].includes(q.id))
    .map((q) => ({ id: q.id, question: q.label, answer: answerText(answers[q.id]) }));
}
