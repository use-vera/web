export interface NavLink {
  href: string;
  label: string;
}

export interface NavMenuItem extends NavLink {
  description: string;
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
        label: "For Organizers",
        description: "List your event, sell tickets, run the door.",
      },
      {
        href: "/for-vendors",
        label: "For Vendors",
        description: "Sell food, drinks and merch at events.",
      },
    ],
  },
];

/** Every routable nav destination, for mobile menus and active-state checks. */
export const allNavLinks: NavLink[] = [
  ...navLinks,
  ...navMenus.flatMap((menu) => menu.items),
];
