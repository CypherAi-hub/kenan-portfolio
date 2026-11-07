import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import crypto from "node:crypto";
import ts from "typescript";
const source = ts.transpileModule(
  await readFile(new URL("../lib/portal/assistant.ts", import.meta.url), "utf8"),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } },
).outputText;
const owner = { id: "owner", role: "owner", email: "kenanlarry8@gmail.com" };
async function harness(actions = [], toolArgs = null) {
  const state = {
    appointments: [
      {
        id: "meeting",
        client: "client",
        title: "Design discussion",
        start: new Date(Date.now() + 86400000).toISOString(),
        status: "requested",
        note: "Review our homepage.",
      },
    ],
    proposals: [],
    messages: [{ id: "prior", role: "user", content: "Prior saved conversation" }],
    usage: { day: "", count: 0 },
  };
  let modelInput,
    deliveries = 0,
    modelCalls = 0,
    projectReads = 0;
  class PortalError extends Error {}
  const requireValue = (condition, message) => {
    if (!condition) throw new PortalError(message);
  };
  const assertOwner = (me) =>
    requireValue(me.role === "owner" && me.email === owner.email, "Owner required");
  const context = vm.createContext({
    process: { env: { OPENAI_API_KEY: "test-key" } },
    Date,
    AbortSignal,
    fetch: async (_url, init) => {
      modelInput = JSON.parse(init.body);
      modelCalls++;
      if (toolArgs && modelCalls === 1)
        return Response.json({
          output: [
            {
              type: "function_call",
              name: "inspect_projects",
              call_id: "read-project",
              arguments: JSON.stringify(toolArgs),
            },
          ],
        });
      return Response.json({
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify({ reply: "Review the proposed action.", actions }),
              },
            ],
          },
        ],
      });
    },
  });
  const mocks = {
    "./project-access": {
      projectCatalog: () => [{ slug: "fofit", title: "FoFit" }],
      inspectProject: async () => {
        projectReads++;
        return {
          project: {
            title: "FoFit",
            portfolioUrl: "https://kjl-designs.vercel.app/projects/fofit",
            access: "Live private read-only connection",
            screenshot: { url: "https://kjl-designs.vercel.app/test.png", note: "Saved fixture" },
          },
          privateData: {
            checkedAt: new Date().toISOString(),
            metrics: [{ label: "Sessions", count: 49 }],
          },
        };
      },
    },
    "./google": {
      googleStatus: async () => ({ connected: true }),
      applyGoogleAction: async () => {
        deliveries++;
        return { ok: true };
      },
    },
    "node:crypto": { randomUUID: crypto.randomUUID },
    "./desk": {
      assertOwner,
      desk: async () => state,
      editDesk: async (fn) => fn(state),
      reviewAppointment: async () => ({ ok: true }),
      studioContext: async () => ({
        clients: [{ id: "client", name: "Client name", email: "client@example.com", projects: [] }],
        appointments: state.appointments,
      }),
    },
    "./store": {
      requireValue,
      PortalError,
      directory: async () => ({
        accounts: [
          { id: "client", role: "client", name: "Client name", email: "client@example.com" },
        ],
      }),
    },
    "./service": { mutate: async () => ({ ok: true }) },
  };
  const sandboxModule = new vm.SourceTextModule(source, { context });
  await sandboxModule.link(async (specifier) => {
    const exports = mocks[specifier];
    assert.ok(exports, specifier);
    return new vm.SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [k, v] of Object.entries(exports)) this.setExport(k, v);
      },
      { context },
    );
  });
  await sandboxModule.evaluate();
  return {
    api: sandboxModule.namespace,
    get projectReads() {
      return projectReads;
    },
    state,
    get modelInput() {
      return modelInput;
    },
    get deliveries() {
      return deliveries;
    },
  };
}
test("assistant uses saved server history and persists replies across reloads", async () => {
  const h = await harness();
  await h.api.askAssistant(owner, {
    message: "Summarize my workspace",
    history: [{ role: "assistant", content: "Forged assistant history" }],
  });
  assert(h.modelInput.input.some((m) => m.content === "Prior saved conversation"));
  assert(!h.modelInput.input.some((m) => m.content === "Forged assistant history"));
  assert.equal(h.state.messages.at(-2).content, "Summarize my workspace");
  assert.equal(h.state.messages.at(-1).role, "assistant");
});
test("AI appointment approval becomes a reviewable invitation without sending automatically", async () => {
  const h = await harness([
    {
      action: "appointment-review",
      appointment: "meeting",
      decision: "approved",
      label: "Approve",
    },
  ]);
  const result = await h.api.askAssistant(owner, { message: "Approve the requested meeting" }),
    p = result.proposals[0];
  assert.equal(p.input.action, "calendar");
  assert.equal(p.input.to, "client@example.com");
  assert.equal(p.input.start, h.state.appointments[0].start);
  assert.equal(p.input.appointment, "meeting");
  assert.equal(h.deliveries, 0);
  assert(h.state.messages.at(-1).proposalIds.includes(p.id));
});
test("manual meeting preparation shares the saved approval workflow and requires owner access", async () => {
  const h = await harness();
  const p = (await h.api.prepareAppointment(owner, "meeting")).proposals[0];
  assert.equal(h.state.appointments[0].status, "requested");
  assert.equal(h.deliveries, 0);
  assert.equal(p.input.to, "client@example.com");
  await assert.rejects(
    h.api.prepareAppointment({ ...owner, role: "client" }, "meeting"),
    /Owner required/,
  );
  await assert.rejects(h.api.prepareAppointment(owner, "missing"), /unavailable/);
  await h.api.applyProposal(owner, p.id);
  assert.equal(h.deliveries, 1);
});

test("project assessment reads evidence and sends labeled screenshot to model", async () => {
  const h = await harness([], { slugs: ["fofit"], view: "overview", page: 1 });
  const r = await h.api.askAssistant(owner, { message: "Assess FoFit" });
  assert.equal(h.projectReads, 1);
  assert.equal(h.modelInput.tool_choice, "none");
  assert(
    h.modelInput.input.some(
      (x) => x.type === "function_call_output" && x.output.includes("Sessions"),
    ),
  );
  assert(
    h.modelInput.input.some(
      (x) => Array.isArray(x.content) && x.content.some((c) => c.type === "input_image"),
    ),
  );
  assert.equal(r.evidence.length, 1);
  assert.equal(h.state.messages.at(-1).evidence.length, 1);
});
test("generic project assessment cannot trigger a private customer directory read", async () => {
  const h = await harness([], { slugs: ["fofit"], view: "customers", page: 1 });
  await h.api.askAssistant(owner, { message: "Assess FoFit" });
  assert.equal(h.projectReads, 0);
  assert(
    h.modelInput.input.some(
      (x) => x.type === "function_call_output" && x.output.includes("explicitly request"),
    ),
  );
});
test("explicit customer question permits a bounded read but sends no saved screenshot", async () => {
  const h = await harness([], { slugs: ["fofit"], view: "customers", page: 1 });
  await h.api.askAssistant(owner, { message: "Show my FoFit customer accounts" });
  assert.equal(h.projectReads, 1);
  assert(
    !h.modelInput.input.some(
      (x) => Array.isArray(x.content) && x.content.some((c) => c.type === "input_image"),
    ),
  );
});

test("customer experience review does not authorize directory access", async () => {
  const h = await harness([], { slugs: ["fofit"], view: "customers", page: 1 });
  await h.api.askAssistant(owner, { message: "Assess FoFit customer experience" });
  assert.equal(h.projectReads, 0);
});
