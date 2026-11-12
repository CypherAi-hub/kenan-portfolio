import { redirect } from "next/navigation";
import { identity } from "@/lib/portal/auth";
import { assertOwner } from "@/lib/portal/desk";
import StudioHeader from "@/components/studio/StudioHeader";
import DeliveryHub from "@/components/delivery/DeliveryHub";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Delivery command center",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function Page() {
  const me = await identity();
  if (!me) redirect("/studio/login");
  if (me.role !== "owner") redirect("/portal/delivery");
  assertOwner(me);
  return (
    <div className="studio">
      <StudioHeader />
      <main id="main">
        <DeliveryHub />
      </main>
    </div>
  );
}
