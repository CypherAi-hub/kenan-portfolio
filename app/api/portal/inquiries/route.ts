import { identity, origin } from "@/lib/portal/auth";
import { readBody } from "@/lib/portal/request";
import { PortalError, requireValue } from "@/lib/portal/store";
import { assertOwner } from "@/lib/portal/desk";
import {
  listInquiries,
  getInquiry,
  updateInquiry,
  retryBrief,
  exportInquiry,
} from "@/lib/intake/service";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
function failure(error: unknown) {
  return json(
    {
      error:
        error instanceof PortalError
          ? error.message
          : "The inquiry could not be loaded or saved. Please retry.",
    },
    error instanceof PortalError ? error.status : 503,
  );
}
export async function GET(request: Request) {
  try {
    const me = await identity();
    requireValue(me, "Sign in to continue.", 401);
    assertOwner(me);
    const query = new URL(request.url).searchParams;
    if (!query.has("id")) return json({ inquiries: await listInquiries(me) });
    const inquiry = await getInquiry(me, query.get("id"));
    if (query.get("download") === "1")
      return new Response(exportInquiry(inquiry), {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="kjl-inquiry-${inquiry.id}.md"`,
          "Cache-Control": "private, no-store",
        },
      });
    return json({ inquiry });
  } catch (e) {
    return failure(e);
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
      input = JSON.parse(await readBody(request, 100000));
    } catch (e) {
      if (e instanceof PortalError) throw e;
      throw new PortalError("Invalid request.");
    }
    requireValue(input && typeof input === "object" && !Array.isArray(input), "Invalid request.");
    if (input.action === "retry") return json({ inquiry: await retryBrief(me, input.id) });
    requireValue(input.action === "save", "Unknown inquiry action.");
    return json({ inquiry: await updateInquiry(me, input) });
  } catch (e) {
    return failure(e);
  }
}
