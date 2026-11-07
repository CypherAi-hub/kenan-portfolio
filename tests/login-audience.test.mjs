import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function harness() {
  const owner = {
    id: "owner",
    role: "owner",
    name: "Kenan",
    email: "kenanlarry8@gmail.com",
    credential: { id: "owner-passkey", counter: 0, publicKey: "aGVsbG8" },
    sessions: [],
    recentChallenges: [],
  };
  const client = {
    id: "client",
    role: "client",
    name: "Client",
    email: "client@example.com",
    credential: { id: "client-passkey", counter: 0, publicKey: "aGVsbG8" },
    sessions: [],
    recentChallenges: [],
  };
  const accounts = [owner, client];
  const jar = new Map();
  let verifyCalls = 0,
    writes = 0,
    options;
  class PortalError extends Error {
    constructor(m, status = 400) {
      super(m);
      this.status = status;
    }
  }
  const requireValue = (c, m, s) => {
    if (!c) throw new PortalError(m, s);
  };
  const context = vm.createContext({
    process: {
      env: { PORTAL_SIGNING_KEY: "x".repeat(40), PORTAL_ORIGIN: "https://kjl-designs.vercel.app" },
    },
    Buffer,
    URL,
    Date,
    TextEncoder,
    Uint8Array,
  });
  const mocks = {
    "node:crypto": {
      createHash: crypto.createHash,
      createHmac: crypto.createHmac,
      timingSafeEqual: crypto.timingSafeEqual,
      randomBytes: crypto.randomBytes,
    },
    "next/headers": {
      cookies: async () => ({
        get: (k) => (jar.has(k) ? { value: jar.get(k) } : undefined),
        set: (k, v) => jar.set(k, v),
        delete: (k) => jar.delete(k),
      }),
    },
    "./store": {
      requireValue,
      directory: async () => ({ accounts }),
      editDirectory: async (f) => {
        writes++;
        return f({ accounts });
      },
    },
    "@simplewebauthn/server": {
      generateAuthenticationOptions: async (o) => {
        options = o;
        return { challenge: "challenge" };
      },
      generateRegistrationOptions: async () => ({ challenge: "registration" }),
      verifyAuthenticationResponse: async () => {
        verifyCalls++;
        return { verified: true, authenticationInfo: { newCounter: 1 } };
      },
      verifyRegistrationResponse: async () => {
        verifyCalls++;
        return {
          verified: true,
          registrationInfo: {
            credential: { id: "new-credential", publicKey: new Uint8Array([1, 2]), counter: 0 },
          },
        };
      },
    },
  };
  const modules = new Map();
  async function load(file) {
    if (modules.has(file)) return modules.get(file);
    const source = ts.transpileModule(
      await readFile(new URL("../lib/portal/" + file + ".ts", import.meta.url), "utf8"),
      { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } },
    ).outputText;
    const m = new vm.SourceTextModule(source, { context });
    modules.set(file, m);
    await m.link(async (name) => {
      if (name === "./access") return load("access");
      const values = mocks[name];
      assert(values, name);
      return new vm.SyntheticModule(
        Object.keys(values),
        function () {
          for (const [k, v] of Object.entries(values)) this.setExport(k, v);
        },
        { context },
      );
    });
    return m;
  }
  const m = await load("auth");
  await m.evaluate();
  return {
    api: m.namespace,
    owner,
    client,
    jar,
    get verifyCalls() {
      return verifyCalls;
    },
    get writes() {
      return writes;
    },
    get options() {
      return options;
    },
    access: modules.get("access").namespace,
  };
}
test("owner authentication filters its passkey; client login keeps account directory private", async () => {
  const h = await harness();
  await h.api.begin(undefined, "owner");
  assert.deepEqual(
    Array.from(h.options.allowCredentials, (x) => x.id),
    ["owner-passkey"],
  );
  await h.api.begin(undefined, "client");
  assert.equal(h.options.allowCredentials, undefined);
});
test("client passkey cannot finish an owner login or create a session", async () => {
  const h = await harness();
  await h.api.begin(undefined, "owner");
  await assert.rejects(h.api.finish({ id: "client-passkey" }), /different sign-in/);
  assert.equal(h.verifyCalls, 0);
  assert.equal(h.writes, 0);
  assert.equal(h.client.sessions.length, 0);
});
test("owner passkey cannot finish client login and challenge cannot be replayed", async () => {
  const h = await harness();
  await h.api.begin(undefined, "client");
  await assert.rejects(h.api.finish({ id: "owner-passkey" }), /different sign-in/);
  await assert.rejects(h.api.finish({ id: "client-passkey" }), /expired/);
  assert.equal(h.writes, 0);
});
test("existing owner and client passkeys still authenticate in their respective entrances", async () => {
  for (const role of ["owner", "client"]) {
    const h = await harness();
    await h.api.begin(undefined, role);
    await h.api.finish({ id: role + "-passkey" });
    assert.equal(h[role].sessions.length, 1);
    assert(h.jar.has("__Host-kjl-session"));
    assert.equal(h.verifyCalls, 1);
  }
});
test("invitations cannot enroll a passkey through a different role entrance", async () => {
  const h = await harness(),
    raw = "a".repeat(43);
  h.client.invitation = { hash: h.api.hash(raw), expires: Date.now() + 60000 };
  await assert.rejects(h.api.begin(raw, "owner"), /sign-in page/);
  assert.equal(h.jar.size, 0);
  await h.api.begin(raw, "client");
  await h.api.finish({ id: "new-credential" }, raw);
  assert.equal(h.client.credential.id, "new-credential");
  assert.equal(h.client.invitation, undefined);
});
test("unknown audience and unrecognized owner identity are rejected", async () => {
  const h = await harness();
  await assert.rejects(h.api.begin(undefined, "admin"), /correct sign-in/);
  h.owner.email = "other@example.com";
  await assert.rejects(h.api.begin(undefined, "owner"), /private invitation/);
  assert.equal(h.access.workspacePath(h.owner), "/studio/login");
  assert.equal(h.access.matchesAudience(h.client, "owner"), false);
});
