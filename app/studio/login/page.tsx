import PortalLogin from "@/components/portal/PortalLogin";
import "../../portal/login.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Studio owner login",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default function OwnerLogin() {
  return <PortalLogin audience="owner" />;
}
