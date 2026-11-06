import type { Metadata } from "next";
import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
import BookingSection from "@/components/studio/BookingSection";
export const metadata: Metadata = {
  title: "Book with me",
  description: "Book a 30-minute website or app discovery call with Kenan Larry.",
};
export default function Book() {
  return (
    <div className="studio">
      <StudioHeader />
      <main>
        <BookingSection standalone />
      </main>
      <StudioFooter />
    </div>
  );
}
