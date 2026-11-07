import { identity, origin } from "@/lib/portal/auth";
import { assertOwner } from "@/lib/portal/desk";
import { projectCatalog, inspectProject, importHireCrate } from "@/lib/portal/project-access";
import { PortalError, requireValue } from "@/lib/portal/store";
import { readBody } from "@/lib/portal/request";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "cache-control": "private, no-store" } });
export async function GET() {
  try {
    const me = await identity();
    requireValue(me, "Sign in to continue.", 401);
    assertOwner(me);
    return json({ projects: projectCatalog() });
  } catch (e) {
    return json(
      { error: e instanceof PortalError ? e.message : "Unable to load project connections." },
      e instanceof PortalError ? e.status : 503,
    );
  }
}
export async function POST(request: Request) {
  try {
    requireValue(request.headers.get("origin") === origin(), "Invalid origin.", 403);
    const me = await identity();
    requireValue(me, "Sign in to continue.", 401);
    assertOwner(me);
    requireValue(
      request.headers.get("content-type")?.startsWith("application/json"),
      "Expected JSON.",
      415,
    );
    let input;
    try {
      input = JSON.parse(await readBody(request, 1048576));
    } catch (e) {
      if (e instanceof PortalError) throw e;
      throw new PortalError("Invalid request.");
    }
    requireValue(input && typeof input === "object" && !Array.isArray(input), "Invalid request.");
    if (input.action === "import-hirecrate") return json(await importHireCrate(me, input.backup));
    requireValue(input.action === "inspect", "Unknown project action.");
    return json(await inspectProject(me, input.slug, input.view || "overview", input.page ?? 1));
  } catch (e) {
    return json(
      { error: e instanceof PortalError ? e.message : "Unable to inspect this project." },
      e instanceof PortalError ? e.status : 503,
    );
  }
}
