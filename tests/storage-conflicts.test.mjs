import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const conditionalConflict =
  "Vercel Blob: The conditional request cannot succeed due to a conflicting operation against this resource.";
class PreconditionError extends Error {}
async function harness({ failure, missing = false, persistent = false }) {
  let stored = missing ? undefined : { count: 0 },
    etag = "1",
    reads = 0,
    writes = 0;
  const delays = [];
  const context = vm.createContext({
    Error,
    Response,
    process: { env: { PORTAL_NAMESPACE: "kjl-qa-unit" } },
    setTimeout: (callback, delay) => {
      delays.push(delay);
      callback();
    },
  });
  const blob = new vm.SyntheticModule(
    ["get", "put", "BlobPreconditionFailedError"],
    function () {
      this.setExport("BlobPreconditionFailedError", PreconditionError);
      this.setExport("get", async () => {
        reads++;
        return stored
          ? { statusCode: 200, stream: Response.json(stored).body, blob: { etag: "W/" + etag } }
          : null;
      });
      this.setExport("put", async (_path, body, options) => {
        writes++;
        if (writes === 1 || persistent) {
          // A competing write won. Retry must read and preserve its value.
          stored = { count: 5 };
          etag = "2";
          throw failure;
        }
        assert.equal(options.ifMatch, etag);
        assert.equal(options.allowOverwrite, true);
        stored = JSON.parse(body);
        etag = "3";
      });
    },
    { context },
  );
  const source = ts.transpileModule(
    await readFile(new URL("../lib/portal/store.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } },
  ).outputText;
  const loadedModule = new vm.SourceTextModule(source, { context });
  await loadedModule.link(() => blob);
  await loadedModule.evaluate();
  return {
    api: loadedModule.namespace,
    delays,
    get value() {
      return stored;
    },
    get reads() {
      return reads;
    },
    get writes() {
      return writes;
    },
  };
}
test("Blob conditional-operation conflicts and ETag conflicts reload before applying a write", async () => {
  for (const failure of [new Error(conditionalConflict), new PreconditionError("ETag mismatch")]) {
    const h = await harness({ failure });
    const result = await h.api.editPrivate(
      "counter",
      () => ({ count: 0 }),
      (record) => ++record.count,
    );
    assert.equal(result, 6);
    assert.equal(h.value.count, 6);
    assert.equal(h.reads, 2);
    assert.equal(h.writes, 2);
    assert.equal(h.delays.length, 1);
    assert(h.delays[0] >= 30 && h.delays[0] < 70);
  }
});
test("a racing initial create adopts the existing object instead of overwriting it", async () => {
  const h = await harness({
    failure: new Error("Blob already exists. Use allowOverwrite."),
    missing: true,
  });
  await h.api.editPrivate(
    "counter",
    () => ({ count: 0 }),
    (record) => ++record.count,
  );
  assert.equal(h.value.count, 6);
  assert.equal(h.writes, 2);
});
test("persistent write contention stops at the existing six-attempt boundary", async () => {
  const h = await harness({ failure: new Error(conditionalConflict), persistent: true });
  await assert.rejects(
    h.api.editPrivate(
      "counter",
      () => ({ count: 0 }),
      (record) => ++record.count,
    ),
    (error) => error.status === 409,
  );
  assert.equal(h.writes, 6);
  assert.equal(h.delays.length, 5);
});
test("unrecognized provider failures are not treated as safe write conflicts", async () => {
  const h = await harness({ failure: new Error("Unknown provider failure") });
  await assert.rejects(
    h.api.editPrivate(
      "counter",
      () => ({ count: 0 }),
      (record) => ++record.count,
    ),
    /Unknown provider/,
  );
  assert.equal(h.writes, 1);
  assert.equal(h.delays.length, 0);
});
