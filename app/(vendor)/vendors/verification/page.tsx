import { DESK } from "@/components/organizer/desk";
import VendorVerification from "@/components/vendors/vendor-verification";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raise your limit",
  description:
    "See how much you can sell, and add the one thing that lifts the limit.",
};

export default function VendorVerificationPage() {
  return (
    <div className={DESK}>
      <VendorVerification />
    </div>
  );
}
