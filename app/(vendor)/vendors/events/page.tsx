import VendorEvents from "@/components/vendors/vendor-events";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your events",
  description:
    "Answer invitations, see the events you are booked for, and apply to events taking vendors.",
};

export default function VendorEventsPage() {
  return <VendorEvents />;
}
