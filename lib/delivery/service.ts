import { assertOwner } from "../portal/desk";
import { publicMember } from "../portal/auth";
import { directory, workspace, readPrivate, editPrivate, requireValue } from "../portal/store";
import type { Account } from "../portal/types";
import { commercialProject, readCommercial } from "./commercial";
import { command, status } from "./domain";
import { emptyDelivery, type DeliveryView, type DeliveryProjectView } from "./types";

function key(client: string) {
  requireValue(
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(client),
    "Client not found.",
    404,
  );
  return "delivery/clients/" + client;
}
async function clients(me: Account) {
  if (me.role === "owner") {
    assertOwner(me);
    return (await directory()).accounts.filter((a) => a.role === "client");
  }
  requireValue(me.role === "client", "Workspace access is required.", 403);
  return [me];
}
export async function deliveryView(me: Account, cookie: string | null): Promise<DeliveryView> {
  const roster = await clients(me),
    projects: DeliveryProjectView[] = [];
  requireValue(
    roster.length <= 100,
    "This roster needs a paginated delivery view. Contact the studio owner.",
    503,
  );
  for (let at = 0; at < roster.length; at += 4) {
    const batches = await Promise.all(
      roster.slice(at, at + 4).map(async (client) => {
        const [portal, state] = await Promise.all([
          workspace(client.id),
          readPrivate(key(client.id), emptyDelivery),
        ]);
        const commercialData = portal.projects.length
          ? await readCommercial(client.id, cookie)
          : null;
        return portal.projects.map((project): DeliveryProjectView => {
          const delivery = state.projects.find((p) => p.project === project.id) || null;
          const commercial = commercialProject(commercialData, client.id, project.id);
          const latest = [...project.updates].sort((a, b) => b.at.localeCompare(a.at))[0];
          return {
            client: { id: client.id, name: client.name, email: client.email },
            project: {
              id: project.id,
              title: project.title,
              brief: project.brief,
              phase: project.phase,
              ...(latest
                ? { latestUpdate: { at: latest.at, body: latest.body, author: latest.author } }
                : {}),
            },
            delivery,
            commercial,
            status: status(delivery, commercial, me.role),
            events: state.events
              .filter((e) => e.project === project.id)
              .slice(-30)
              .reverse(),
          };
        });
      }),
    );
    projects.push(...batches.flat());
  }
  return { me: publicMember(me), projects, generatedAt: new Date().toISOString() };
}
export async function deliveryAction(
  me: Account,
  cookie: string | null,
  input: Record<string, unknown>,
) {
  const roster = await clients(me);
  const client = roster.find((c) => c.id === input.client);
  requireValue(client, "Client not found.", 404);
  const project = (await workspace(client.id)).projects.find((p) => p.id === input.project);
  requireValue(project, "Project not found.", 404);
  const commercial = commercialProject(
    await readCommercial(client.id, cookie),
    client.id,
    project.id,
  );
  await editPrivate(key(client.id), emptyDelivery, (state) =>
    command(state, publicMember(me), project, commercial, input),
  );
  return { ok: true };
}
