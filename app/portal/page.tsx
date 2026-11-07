import StudioHeader from "@/components/studio/StudioHeader";
import Portal from "@/components/portal/Portal";
import { identity } from "@/lib/portal/auth";
import { workspacePath, matchesAudience } from "@/lib/portal/access";
import { redirect } from "next/navigation";
import "./portal.css";
import "./assistant.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Client workspace",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const me = await identity();
  if (!me) {
    const checkout = (await searchParams).checkout;
    redirect(
      "/portal/login" +
        (checkout === "returned" || checkout === "cancelled" ? "?checkout=" + checkout : ""),
    );
  }
  if (!matchesAudience(me, "client")) redirect(workspacePath(me));
  return (
    <div className="studio">
      <StudioHeader />
      <main id="main" className="portal">
        <Portal audience="client" />
      </main>
    </div>
  );
}
