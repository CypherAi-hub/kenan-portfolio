import { origin } from "@/lib/portal/auth";
import { readBody } from "@/lib/portal/request";
import { PortalError, requireValue } from "@/lib/portal/store";
import { validateAnswers } from "@/lib/intake/questions";
import { clarify } from "@/lib/intake/ai";
import { publicLimit, submitInquiry } from "@/lib/intake/service";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
export async function POST(request: Request) {
  try {
    requireValue(request.headers.get("origin") === origin(), "Invalid origin.", 403);
    requireValue(
      request.headers.get("content-type")?.startsWith("application/json"),
      "Expected JSON.",
      415,
    );
    let input;
    try {
      input = JSON.parse(await readBody(request, 65000));
    } catch (e) {
      if (e instanceof PortalError) throw e;
      throw new PortalError("Invalid request.");
    }
    requireValue(input && typeof input === "object" && !Array.isArray(input), "Invalid request.");
    requireValue(!input.website, "Please leave the website verification field empty.");
    if (input.action === "clarify") {
      requireValue(
        input.allowAI === true,
        "Please allow AI review before requesting follow-up questions.",
      );
      let answers;
      try {
        answers = validateAnswers(input.answers);
      } catch (e) {
        throw new PortalError(e instanceof Error ? e.message : "Check your answers.");
      }
      await publicLimit(request, "clarify");
      return json(await clarify(answers));
    }
    requireValue(input.action === "submit", "Unknown inquiry action.");
    return json(await submitInquiry(input, request));
  } catch (error) {
    return json(
      {
        error:
          error instanceof PortalError
            ? error.message
            : "Project discovery is temporarily unavailable. Your answers are still on this page; please try again.",
      },
      error instanceof PortalError ? error.status : 503,
    );
  }
}
