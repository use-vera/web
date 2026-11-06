import { DESK } from "@/components/organizer/desk";
import VendorMenuManager from "@/components/vendors/vendor-menu-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your menu",
  description:
    "Add what you sell, group it your way, and switch items off when they run out.",
};

export default function VendorMenuPage() {
  return (
    <div className={DESK}>
      <VendorMenuManager />
    </div>
  );
}
