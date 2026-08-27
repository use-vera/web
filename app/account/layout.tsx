"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { CreditCard, Sparkles, Ticket } from "lucide-react";

const NAV = [
  { href: "/account/tickets", label: "Tickets", icon: Ticket },
  { href: "/account/premium", label: "Premium", icon: Sparkles },
  { href: "/account/payments", label: "Payments", icon: CreditCard },
];

const AccountLayout = ({ children }: { children: React.ReactNode }) => (
  <DashboardShell
    nav={NAV}
    role="Your account"
    redirectTo="/account/tickets"
    signedOutIcon={<Ticket className="h-6 w-6" />}
    signedOutTitle="Sign in to see your account"
    signedOutDescription="Your tickets, your payments, and anything you have listed for resale."
  >
    {children}
  </DashboardShell>
);

export default AccountLayout;
