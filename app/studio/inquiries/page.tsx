import { redirect } from "next/navigation";
import { identity } from "@/lib/portal/auth";
import { assertOwner } from "@/lib/portal/desk";
import StudioHeader from "@/components/studio/StudioHeader";
import InquiryInbox from "@/components/intake/InquiryInbox";
import "../../start-project/intake.css";
import "./inbox.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Project inquiries",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function InquiriesPage() {
  const me = await identity();
  if (!me) redirect("/studio/login");
  if (me.role !== "owner") redirect("/portal");
  assertOwner(me);
  return (
    <div className="studio">
      <StudioHeader />
      <main className="studio-shell" id="main">
        <InquiryInbox />
      </main>
    </div>
  );
}
