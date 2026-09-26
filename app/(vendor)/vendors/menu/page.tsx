import VendorMenuManager from "@/components/vendors/vendor-menu-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your menu",
  description:
    "Add what you sell, group it your way, and switch items off when they run out.",
};

export default function VendorMenuPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <VendorMenuManager />
    </div>
  );
}
