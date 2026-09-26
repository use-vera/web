"use client";

import { useSession } from "@/lib/hooks/use-auth";
import { useMyVendor } from "@/lib/hooks/use-vendor";
import { ROUTES } from "@/lib/utils";

/**
 * Where a "sell on Vera" link should actually go for the person clicking it.
 *
 * Someone already signed in with a vendor account should never be sent back to
 * a sign-in page: they are asking for their dashboard, and the button should
 * take them there.
 */
export const useVendorEntry = () => {
  const sessionQuery = useSession();
  const user = sessionQuery.data?.user ?? null;

  /* Only asked once there is a session to ask about: signed-out visitors on
     the marketing pages should not fire an authed request. */
  const vendorQuery = useMyVendor(Boolean(user));
  const vendor = vendorQuery.data ?? null;

  const hasVendor = Boolean(vendor);

  return {
    user,
    vendor,
    hasVendor,
    /* Still deciding. Links stay correct either way, this only lets callers
       hold back a label that would otherwise flip. */
    isResolving:
      sessionQuery.isPending || (Boolean(user) && vendorQuery.isPending),
    /** For "start selling". */
    startHref: !user
      ? ROUTES.VENDOR_SIGN_UP
      : hasVendor
        ? ROUTES.VENDOR_MENU
        : ROUTES.VENDOR_ONBOARDING,
    /** For "I already sell on Vera". */
    returningHref: !user
      ? ROUTES.VENDOR_SIGN_IN
      : hasVendor
        ? ROUTES.VENDOR_MENU
        : ROUTES.VENDOR_ONBOARDING,
  };
};
