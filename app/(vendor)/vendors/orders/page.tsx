import { DESK } from "@/components/organizer/desk";
import VendorOrderEvents from "@/components/vendors/vendor-order-events";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description: "Pick the event you're working and take its orders.",
};

export default function VendorOrdersPage() {
  return (
    <div className={DESK}>
      <VendorOrderEvents />
    </div>
  );
}
