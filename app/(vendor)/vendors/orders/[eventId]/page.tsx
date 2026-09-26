import VendorOrderQueueBoard from "@/components/vendors/vendor-order-queue-board";
import type { Metadata } from "next";

type Props = { params: Promise<{ eventId: string }> };

export const metadata: Metadata = {
  title: "Orders",
  description:
    "Work tonight's queue: new orders, what you're preparing, and what's ready to hand over.",
};

export default async function VendorEventOrdersPage({ params }: Props) {
  const { eventId } = await params;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <VendorOrderQueueBoard eventId={eventId} />
    </div>
  );
}
