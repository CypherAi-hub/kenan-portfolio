import PortalLogin from "@/components/portal/PortalLogin";
import "../login.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Client login",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default function ClientLogin() {
  return <PortalLogin audience="client" />;
}
