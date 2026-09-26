"use client";

import LogoMark from "@/components/logo-mark";
import VendorUserMenu from "@/components/vendors/vendor-user-menu";
import { useMyVendor } from "@/lib/hooks/use-vendor";
import { cn, ROUTES } from "@/lib/utils";
import {
  ArrowLeft,
  CalendarDays,
  ListChecks,
  ShieldCheck,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Chrome for the vendor workspace.
 *
 * Every section a vendor has: tonight's orders, their menu, their events and
 * their money.
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
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="text-base font-bold text-foreground">Vera</span>
          </Link>

          <span className="hidden text-sm text-muted-foreground sm:inline">
            /
          </span>
          <span className="hidden truncate text-sm font-semibold text-foreground sm:inline">
            {vendor?.businessName ?? "Vendor setup"}
          </span>

          {vendor ? (
            <nav className="ml-auto flex items-center gap-1">
              {[
                {
                  href: ROUTES.VENDOR_ORDERS,
                  label: "Orders",
                  Icon: ListChecks,
                },
                {
                  href: ROUTES.VENDOR_MENU,
                  label: "Menu",
                  Icon: UtensilsCrossed,
                },
                {
                  href: ROUTES.VENDOR_EVENTS,
                  label: "Events",
                  Icon: CalendarDays,
                },
                { href: ROUTES.VENDOR_MONEY, label: "Money", Icon: Wallet },
                {
                  href: ROUTES.VENDOR_VERIFICATION,
                  label: "Limits",
                  Icon: ShieldCheck,
                },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    pathname === href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          ) : (
            <Link
              href="/"
              className="ml-auto flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Vera
            </Link>
          )}

          <div className="ml-2 shrink-0">
            <VendorUserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default VendorWorkspaceShell;
