"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { CalendarDays, TrendingUp, Wallet } from "lucide-react";

const NAV = [
  { href: "/organizer/events", label: "Events", icon: CalendarDays },
  { href: "/organizer/sales", label: "Sales", icon: TrendingUp },
  { href: "/organizer/payouts", label: "Payouts", icon: Wallet },
];

const OrganizerLayout = ({ children }: { children: React.ReactNode }) => (
  <DashboardShell
    nav={NAV}
    role="Organizer"
    redirectTo="/organizer/events"
    signedOutIcon={<CalendarDays className="h-6 w-6" />}
    signedOutTitle="Sign in to manage your events"
    signedOutDescription="Create events, sell tickets, scan people in at the door, and see how the night went."
  >
    {children}
  </DashboardShell>
);

export default OrganizerLayout;
