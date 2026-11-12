import { redirect } from "next/navigation";
import { identity } from "@/lib/portal/auth";
import StudioHeader from "@/components/studio/StudioHeader";
import DeliveryHub from "@/components/delivery/DeliveryHub";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your project delivery",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function Page() {
  const me = await identity();
  if (!me) redirect("/portal/login");
  if (me.role !== "client") redirect("/studio/delivery");
  return (
    <div className="studio">
      <StudioHeader />
      <main id="main">
        <DeliveryHub />
      </main>
    </div>
  );
}
