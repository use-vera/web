"use client";

import { DashboardShell, type DashboardNavItem } from "@/components/dashboard-shell";
import { POSTER_TONES } from "@/components/vera/event-poster";
import { useMyVendor } from "@/lib/hooks/use-vendor";
import { type Vendor } from "@/lib/types/vendor";
import { ROUTES } from "@/lib/utils";
import { ArrowUpRight, CalendarDays, ListChecks, ShieldCheck, UtensilsCrossed, Wallet } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const NAV: DashboardNavItem[] = [
  { href: ROUTES.VENDOR_ORDERS, label: "Orders", icon: ListChecks },
  { href: ROUTES.VENDOR_MENU, label: "Menu", icon: UtensilsCrossed },
  { href: ROUTES.VENDOR_EVENTS, label: "Events", icon: CalendarDays },
  { href: ROUTES.VENDOR_MONEY, label: "Money", icon: Wallet },
  { href: ROUTES.VENDOR_VERIFICATION, label: "Limits", icon: ShieldCheck },
];

const LEVEL_LABEL: Record<Vendor["verificationLevel"], string> = {
  starter: "Starter",
  verified: "Verified",
  registered: "Registered business",
};

/** The business this desk belongs to, at the top of the rail. */
const BusinessCard = ({ vendor }: { vendor: Vendor }) => (
  <div className="flex items-center gap-3 rounded-[22px] bg-secondary p-2.5">
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] text-base font-extrabold"
      style={{ backgroundColor: POSTER_TONES.yellow.bg, color: POSTER_TONES.yellow.fg }}
    >
      {vendor.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={vendor.logoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        vendor.businessName.charAt(0).toUpperCase()
      )}
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-sm font-bold">{vendor.businessName}</span>
      <span className="truncate text-xs text-muted-foreground">{LEVEL_LABEL[vendor.verificationLevel]}</span>
    </span>
    {vendor.slug ? (
      <a
        href={`/vendors/${vendor.slug}`}
        target="_blank"
        rel="noreferrer"
        aria-label="View your public page"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
      >
        <ArrowUpRight className="h-4 w-4" />
      </a>
    ) : null}
  </div>
);

/**
 * The vendor's desk: the same dark rail as the organizer's, holding their
 * business and the five things a vendor does. Until they have a vendor
 * account the rail stays empty and the page walks them through setup.
 */
const VendorWorkspaceShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const vendorQuery = useMyVendor();
  const vendor = vendorQuery.data ?? null;

  const onOnboarding = pathname === ROUTES.VENDOR_ONBOARDING;

  useEffect(() => {
    /* Only on a successful "you have no vendor account" answer. A failed
       request is not the same as not having one, and bouncing someone to
       sign-up because a call timed out reads exactly like being logged out. */
    if (!vendorQuery.isSuccess || vendor || onOnboarding) {
      return;
    }

    router.replace(ROUTES.VENDOR_ONBOARDING);
  }, [vendor, vendorQuery.isSuccess, onOnboarding, router]);

  return (
    <DashboardShell
      nav={vendor ? NAV : []}
      role="Vendor"
      railContext={vendor ? <BusinessCard vendor={vendor} /> : null}
      redirectTo={ROUTES.VENDOR_ORDERS}
      signedOutLead="sign in to run your"
      signedOutAccent="stall."
      signedOutDescription="Take orders at events, keep your menu up to date, and see what you've earned."
    >
      {children}
    </DashboardShell>
  );
};

export default VendorWorkspaceShell;
