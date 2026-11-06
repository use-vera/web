"use client";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { SettingsDialog } from "@/components/settings-dialog";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DisplayHeading from "@/components/vera/display-heading";
import { useSession } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import { CreditCard, Settings, Sparkles, Ticket, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

interface AccountTab {
  href: string;
  label: string;
  icon: LucideIcon;
}

const TABS: AccountTab[] = [
  { href: "/account/tickets", label: "Tickets", icon: Ticket },
  { href: "/account/payments", label: "Payments", icon: CreditCard },
  { href: "/account/premium", label: "Premium", icon: Sparkles },
];

const CONTAINER = "mx-auto w-full max-w-[1240px] px-[clamp(16px,4vw,40px)]";

/* The app's filter pill: ink when on, an outline when off. */
const tabClass = (active: boolean) =>
  cn(
    "flex h-11 shrink-0 items-center gap-2 rounded-full border-[1.5px] px-[18px] text-[15px] font-semibold whitespace-nowrap transition-colors",
    active ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:border-foreground",
  );

const firstName = (fullName: string) => fullName.trim().split(/\s+/)[0]?.toLowerCase() || "there";

/**
 * The signed-in person's own corner of the site. It sits inside the public
 * site (same header, footer and voice) rather than in the organizer's sidebar
 * chrome: someone checking a ticket is still a guest, not running anything.
 */
const AccountShell = ({ children }: { children: ReactNode }) => {
  const { openAuthModal } = useAuthModal();
  const sessionQuery = useSession();
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const user = sessionQuery.data?.user;
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  /* A ticket's own page has its own heading and a way back; the greeting would push the QR down. */
  const onTicketPage = pathname.startsWith("/account/tickets/");

  let body: ReactNode;

  if (sessionQuery.isLoading) {
    body = (
      <div className="flex flex-col gap-6" aria-busy="true">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-20 w-full max-w-md rounded-3xl" />
        <Skeleton className="h-11 w-full max-w-sm rounded-full" />
      </div>
    );
  } else if (!user) {
    body = (
      <div className="flex max-w-4xl flex-col items-start gap-5 py-[clamp(24px,6vw,72px)]">
        <DisplayHeading as="h1" lead="sign in to see your" accent="tickets." />
        <p className="text-lg text-muted-foreground">Your tickets, your payments, and anything you have listed for resale.</p>
        <Button variant="ink" size="lg" onClick={() => openAuthModal({ view: "sign-in", redirectTo: pathname })}>
          Sign in
        </Button>
      </div>
    );
  } else {
    body = (
      <>
        {onTicketPage ? null : (
          <header className="flex flex-col gap-7 pb-8">
            <div className="flex items-end justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-5">
                <Avatar className="size-16 text-xl font-extrabold">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <DisplayHeading as="h1" lead="hey," accent={`${firstName(user.fullName)}.`} className="text-[clamp(44px,7vw,96px)]" />
              </div>
              <Button variant="line" size="sm" className="h-11 shrink-0 px-4" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sr-only sm:hidden">Settings</span>
              </Button>
            </div>

            <nav aria-label="Your account" className="-mx-[clamp(16px,4vw,40px)] flex gap-2 overflow-x-auto px-[clamp(16px,4vw,40px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((tab) => {
                const active = isCurrent(tab.href);
                return (
                  <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={tabClass(active)}>
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </header>
        )}
        {children}
      </>
    );
  }

  return (
    <>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <SiteHeader />
      <main className={cn(CONTAINER, "min-h-[60vh] pt-[clamp(16px,3vw,40px)] pb-24")}>{body}</main>
      <SiteFooter />
    </>
  );
};

export default AccountShell;
