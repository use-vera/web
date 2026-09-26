import VendorOnboarding from "@/components/vendors/vendor-onboarding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set up your vendor account",
  description:
    "Add your business, your menu and your bank account, and start selling at events on Vera.",
};

export default function VendorOnboardingPage() {
  return <VendorOnboarding />;
}
