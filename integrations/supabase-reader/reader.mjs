// Dedicated, bounded, read-only bridge. The app's service key never leaves its own project.
const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "cache-control": "private, no-store",
      "content-type": "application/json",
      "x-content-type-options": "nosniff",
    },
  });
export async function handleProjectRead(request, env, send = fetch) {
  const digest = async (text) =>
    Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))),
    )
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  const supplied =
    request.headers.get("authorization")?.match(/^Bearer ([A-Za-z0-9_-]{40,100})$/)?.[1] || "";
  const expected = env("KJL_PROJECT_ACCESS_HASH") || "";
  const actual = await digest(supplied);
  let difference = actual.length ^ expected.length;
  for (let i = 0; i < actual.length; i++)
    difference |= actual.charCodeAt(i) ^ (expected.charCodeAt(i) || 0);
  if (!supplied || !expected || difference !== 0) return json({ error: "Unauthorized" }, 401);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (Number(request.headers.get("content-length") || 0) > 1500)
    return json({ error: "Request too large" }, 413);
  let input;
  try {
    const text = await request.text();
    if (text.length > 1500) return json({ error: "Request too large" }, 413);
    input = JSON.parse(text);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (
    !input ||
    !["overview", "customers"].includes(input.view) ||
    Object.keys(input).some((k) => !["view", "page"].includes(k))
  )
    return json({ error: "Unsupported read operation" }, 400);
  const page = input.page ?? 1;
  if (!Number.isInteger(page) || page < 1 || page > 100)
    return json({ error: "Invalid page" }, 400);
  const source = env("KJL_SOURCE_GROUP");
  const tables =
    source === "fofit"
      ? [
          ["Training sessions", "workout_sessions"],
          ["Coaching groups", "coach_groups"],
        ]
      : source === "ultraflips"
        ? [
            ["Catalog cards", "cards"],
            ["Native holdings", "holdings"],
            ["Reviewed research sales", "native_research_sales"],
          ]
        : null;
  if (!tables) return json({ error: "Source is unavailable" }, 503);
  const base = env("SUPABASE_URL"),
    key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !key) return json({ error: "Source is unavailable" }, 503);
  const headers = { apikey: key, authorization: "Bearer " + key };
  const read = (path, method = "GET") =>
    send(base + path, {
      method,
      headers: { ...headers, Prefer: "count=exact" },
      signal: AbortSignal.timeout(8000),
      redirect: "error",
    });
  try {
    const r = await read(
      "/auth/v1/admin/users?page=" + page + "&per_page=" + (input.view === "customers" ? 10 : 1),
    );
    if (!r.ok) return json({ error: "Account directory unavailable" }, 503);
    const auth = await r.json();
    const total = Number.isFinite(auth.total) ? auth.total : null;
    if (input.view === "customers")
      return json({
        source,
        checkedAt: new Date().toISOString(),
        access: "read-only",
        view: "customers",
        page,
        total,
        records: (auth.users || []).slice(0, 10).map((u) => ({
          id: u.id,
          email: u.email || null,
          displayName:
            typeof (u.user_metadata?.display_name || u.user_metadata?.full_name) === "string"
              ? (u.user_metadata.display_name || u.user_metadata.full_name).slice(0, 160)
              : null,
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at || null,
        })),
        excluded:
          "Passwords, tokens, health records, workout details, financial details and private files are not exposed.",
      });
    const metrics = await Promise.all(
      tables.map(async ([label, table]) => {
        try {
          const r = await read("/rest/v1/" + table + "?select=*&limit=0", "HEAD");
          const range = r.headers.get("content-range");
          const count = range?.match(/\/(\d+)$/)?.[1];
          return { label, count: r.ok && count ? Number(count) : null, available: r.ok };
        } catch {
          return { label, count: null, available: false };
        }
      }),
    );
    return json({
      source,
      checkedAt: new Date().toISOString(),
      access: "read-only",
      view: "overview",
      accounts: total,
      metrics,
      customerRecordsAvailable: true,
      dataCaveat:
        "Counts are stored rows and may include QA or seed data. They are not active-user, adoption or revenue figures.",
    });
  } catch {
    return json({ error: "Source request could not complete" }, 503);
  }
}
