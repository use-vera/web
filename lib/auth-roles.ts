import { ROUTES } from "@/lib/utils";

/**
 * Attendees and merchants sign in through the same forms and the same
 * endpoints — a Vera account is a Vera account. The role only changes what the
 * page says, what it links to, and where it sends you afterwards.
 */
export type AuthRole = "attendee" | "merchant";

export type AuthView = "sign-in" | "sign-up";

interface AuthViewCopy {
  title: string;
  subtitle: string;
  action: string;
  /** The same view for the other role, offered under the form. */
  crossHref: string;
  crossLabel: string;
}

export const AUTH_COPY: Record<AuthRole, Record<AuthView, AuthViewCopy>> = {
  attendee: {
    "sign-in": {
      title: "Good to see you again.",
      subtitle: "Sign in to grab your ticket.",
      action: "Sign in",
      crossHref: ROUTES.VENDOR_SIGN_IN,
      crossLabel: "Sign in as a merchant instead",
    },
    "sign-up": {
      title: "Create your account.",
      subtitle: "Takes a few seconds, then you can grab your ticket.",
      action: "Create account",
      crossHref: ROUTES.VENDOR_SIGN_UP,
      crossLabel: "Sign up as a merchant instead",
    },
  },
  merchant: {
    "sign-in": {
      title: "Welcome back.",
      subtitle: "Sign in to your vendor workspace.",
      action: "Sign in",
      crossHref: ROUTES.SIGN_IN,
      crossLabel: "Sign in as an attendee instead",
    },
    "sign-up": {
      title: "Start selling at events.",
      subtitle: "Create your vendor account. Your menu and payouts come next.",
      action: "Create vendor account",
      crossHref: ROUTES.SIGN_UP,
      crossLabel: "I'm here to buy tickets instead",
    },
  },
};

export const AUTH_ROUTES: Record<AuthRole, Record<AuthView, string>> = {
  attendee: { "sign-in": ROUTES.SIGN_IN, "sign-up": ROUTES.SIGN_UP },
  merchant: {
    "sign-in": ROUTES.VENDOR_SIGN_IN,
    "sign-up": ROUTES.VENDOR_SIGN_UP,
  },
};

/**
 * Where each role lands when it has nowhere particular to go back to.
 *
 * Merchants go to onboarding, which forwards them to their menu if they have
 * already set a vendor account up.
 */
export const POST_AUTH_ROUTE: Record<AuthRole, string> = {
  attendee: "/",
  merchant: ROUTES.VENDOR_ONBOARDING,
};
