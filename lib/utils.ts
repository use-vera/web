import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const ROUTES = Object.freeze({
  DOWNLOAD: "/download",
  TICKETS: "/tickets",
  DEVELOPERS: "/developers",
  DEVELOPERS_DOCS: "/developers/docs",
  DEVELOPERS_API: "/developers/api",
  DEVELOPERS_SANDBOX: "/developers/sandbox",
  DEVELOPERS_KEYS: "/developers/keys",
  /* A static single-file demo in public/, not a Next route: it doubles as a
     template people download and run themselves. */
  DEVELOPERS_DEMO: "/vera-api-demo.html",
  ORGANIZER: "/organizer",
  FOR_VENDORS: "/for-vendors",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  VENDOR_SIGN_IN: "/vendors/sign-in",
  VENDOR_SIGN_UP: "/vendors/sign-up",
  VENDOR_ONBOARDING: "/vendors/onboarding",
  VENDOR_MENU: "/vendors/menu",
  VENDOR_EVENTS: "/vendors/events",
  VENDOR_ORDERS: "/vendors/orders",
  VENDOR_MONEY: "/vendors/money",
  VENDOR_VERIFICATION: "/vendors/verification",
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
