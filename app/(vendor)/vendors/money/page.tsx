import VendorMoney from "@/components/vendors/vendor-money";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Money",
  description: "What you've earned, what's still held, and when it reaches your bank.",
};

export default function VendorMoneyPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <VendorMoney />
    </div>
  );
}
