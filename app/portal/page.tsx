import StudioHeader from "@/components/studio/StudioHeader";
import Portal from "@/components/portal/Portal";
import "./portal.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Client workspace",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default function PortalPage() {
  return (
    <div className="studio">
      <StudioHeader />
      <main id="main" className="portal">
        <Portal />
      </main>
    </div>
  );
}
