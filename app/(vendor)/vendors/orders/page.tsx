import VendorOrderEvents from "@/components/vendors/vendor-order-events";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description: "Pick the event you're working and take its orders.",
};

export default function VendorOrdersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <VendorOrderEvents />
    </div>
  );
}
