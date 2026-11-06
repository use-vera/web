import type { PosterTone } from "@/components/vera/event-poster";
import { BookOpen, Braces, FlaskConical, KeyRound, Megaphone, Store, type LucideIcon } from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
}

export interface NavMenuItem extends NavLink {
  description: string;
  /* The header menus show each item as a coloured tile, in the poster tones. */
  icon: LucideIcon;
  tone: PosterTone;
}

export interface NavMenu {
  label: string;
  items: NavMenuItem[];
}

export const navLinks: NavLink[] = [
  { href: "/events", label: "Events & Tickets" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About Us" },
];

/**
 * Organizers and vendors are both people who earn on Vera, so they share one
 * nav entry instead of each taking a slot in a header that is already full.
 */
export const navMenus: NavMenu[] = [
  {
    label: "Sell on Vera",
    items: [
      {
        href: "/for-organizers",
        icon: Megaphone,
        tone: "green",
        label: "For Organizers",
        description: "List your event, sell tickets, run the door.",
      },
      {
        href: "/for-vendors",
        icon: Store,
        tone: "yellow",
        label: "For Vendors",
        description: "Sell food, drinks and merch at events.",
      },
    ],
  },
  /* The portal used to be reachable only from the signed-in avatar menu,
     which hid it from the people most likely to want it: developers
     evaluating Vera before anyone on their team has an account. */
  {
    label: "Developers",
    items: [
      {
        href: "/developers/docs",
        icon: BookOpen,
        tone: "blue",
        label: "Documentation",
        description: "Guides that walk through each flow end to end.",
      },
      {
        href: "/developers/api",
        icon: Braces,
        tone: "pink",
        label: "API reference",
        description: "Every endpoint, parameter and response.",
      },
      {
        href: "/developers/sandbox",
        icon: FlaskConical,
        tone: "ink",
        label: "Sandbox",
        description: "Send real requests from the browser.",
      },
      {
        href: "/developers/keys",
        icon: KeyRound,
        tone: "cream",
        label: "API keys",
        description: "Create and roll your keys. Sign-in required.",
      },
    ],
  },
];

/** Every routable nav destination, for mobile menus and active-state checks. */
export const allNavLinks: NavLink[] = [
  ...navLinks,
  ...navMenus.flatMap((menu) => menu.items),
];
