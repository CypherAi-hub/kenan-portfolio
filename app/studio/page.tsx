import StudioHeader from "@/components/studio/StudioHeader";
import Portal from "@/components/portal/Portal";
import { identity } from "@/lib/portal/auth";
import { matchesAudience, workspacePath } from "@/lib/portal/access";
import { redirect } from "next/navigation";
import "../portal/portal.css";
import "../portal/assistant.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private studio",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function StudioPage() {
  const me = await identity();
  if (!me) redirect("/studio/login");
  if (!matchesAudience(me, "owner")) redirect(workspacePath(me));
  return (
    <div className="studio">
      <StudioHeader />
      <main id="main" className="portal">
        <Portal audience="owner" />
      </main>
    </div>
  );
}
