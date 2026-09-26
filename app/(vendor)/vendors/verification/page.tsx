import VendorVerification from "@/components/vendors/vendor-verification";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raise your limit",
  description:
    "See how much you can sell, and add the one thing that lifts the limit.",
};

export default function VendorVerificationPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <VendorVerification />
    </div>
  );
}
