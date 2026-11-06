"use client";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { SettingsDialog } from "@/components/settings-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import DisplayHeading from "@/components/vera/display-heading";
import Wordmark from "@/components/vera/wordmark";
import { useSession } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ArrowLeft, Menu, Plus, Settings, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  nav: DashboardNavItem[];
  /** Small label under the account name, e.g. "Organizer". */
  role: string;
  /** The one thing this dashboard is for, as a big button at the top of the rail. */
  primaryAction?: { href: string; label: string; icon?: LucideIcon };
  /** Who this desk belongs to, under the wordmark (e.g. the vendor's business). */
  railContext?: ReactNode;
  /** Signed-out heading, as a lowercase lead and a green accent. */
  signedOutLead: string;
  signedOutAccent: string;
  signedOutDescription: string;
  redirectTo: string;
  children: ReactNode;
}

const RAIL_WIDTH = "w-[264px]";

/**
 * The organizer's and vendor's desk: a dark rail (the same ink the "for organizers" pages
 * wear) holding the nav and the main action, and the work itself on the
 * light page beside it. The page scrolls the window, so Lenis and the
 * scroll-to-top on navigation behave as they do everywhere else.
 */
export const DashboardShell = ({ nav, role, primaryAction, railContext, signedOutLead, signedOutAccent, signedOutDescription, redirectTo, children }: DashboardShellProps) => {
  const { openAuthModal } = useAuthModal();
  const sessionQuery = useSession();
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const user = sessionQuery.data?.user;
  const PrimaryIcon = primaryAction?.icon ?? Plus;
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  /* Deepest match wins, so /organizer/events does not resolve to /organizer. */
  const currentLabel = [...nav].sort((a, b) => b.href.length - a.href.length).find((item) => isCurrent(item.href))?.label ?? role;

  if (sessionQuery.isLoading) {
    return (
      <main className="flex min-h-screen bg-background" aria-busy="true">
        <div className={cn("dark hidden shrink-0 bg-background lg:block", RAIL_WIDTH)} />
        <div className="flex flex-1 flex-col gap-6 p-[clamp(16px,3vw,40px)]">
          <Skeleton className="h-16 w-full max-w-md rounded-3xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-[24px]" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col bg-background">
        <div className="px-[clamp(16px,4vw,40px)] pt-6">
          <Link href="/" aria-label="Vera home" className="w-fit">
            <Wordmark />
          </Link>
        </div>
        <div className="flex flex-1 flex-col justify-center px-[clamp(16px,4vw,40px)] py-16">
          <div className="flex max-w-4xl flex-col items-start gap-5">
            <DisplayHeading as="h1" lead={signedOutLead} accent={signedOutAccent} />
            <p className="max-w-xl text-lg text-muted-foreground">{signedOutDescription}</p>
            <Button variant="ink" size="lg" onClick={() => openAuthModal({ view: "sign-in", redirectTo })}>
              Sign in
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const navLink = (item: DashboardNavItem, onNavigate?: () => void) => {
    const active = isCurrent(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-12 items-center gap-3 rounded-full px-4 text-[15px] font-semibold transition-colors",
          active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2.2} />
        {item.label}
      </Link>
    );
  };

  const rail = (onNavigate?: () => void) => (
    <>
      <div className="flex items-center justify-between gap-2 px-2">
        <Link href="/" aria-label="Vera home" onClick={onNavigate}>
          <Wordmark />
        </Link>
        <span className="rounded-full border-[1.5px] border-border px-2.5 py-1 text-xs font-bold text-muted-foreground">{role}</span>
      </div>

      {railContext ? <div className="mt-6">{railContext}</div> : null}

      {primaryAction ? (
        <Link
          href={primaryAction.href}
          onClick={onNavigate}
          className="mt-7 flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <PrimaryIcon className="h-[18px] w-[18px]" strokeWidth={2.6} />
          {primaryAction.label}
        </Link>
      ) : null}

      <nav aria-label="Sections" className={cn("flex flex-col gap-1", nav.length > 0 && "mt-6")}>
        {nav.map((item) => navLink(item, onNavigate))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 pt-6">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            setSettingsOpen(true);
          }}
          className="flex h-11 cursor-pointer items-center gap-3 rounded-full px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </button>
        <Link
          href="/"
          onClick={onNavigate}
          className="flex h-11 items-center gap-3 rounded-full px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to Vera
        </Link>

        <div className="mt-3 flex items-center gap-3 rounded-[22px] bg-secondary p-2.5">
          <Avatar size="lg">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold">{user.fullName}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      <aside className={cn("dark fixed inset-y-0 left-0 z-40 hidden flex-col overflow-y-auto bg-background p-4 pt-6 text-foreground lg:flex", RAIL_WIDTH)} data-lenis-prevent>
        {rail()}
      </aside>

      {/* Phones get the rail as a drawer from the same edge. */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="dark gap-0 border-0 bg-background p-4 pt-6 text-foreground data-[side=left]:w-[18rem] data-[side=left]:sm:max-w-[18rem]"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Move between sections of your {role.toLowerCase()} area.</SheetDescription>
          <div className="flex h-full flex-col">{rail(() => setNavOpen(false))}</div>
        </SheetContent>
      </Sheet>

      <div className="min-h-screen bg-background lg:pl-[264px]">
        <div className="dark sticky top-0 z-30 flex h-16 items-center gap-2 bg-background px-3 text-foreground lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-secondary text-foreground active:scale-[0.96]"
          >
            <Menu className="h-5 w-5" />
          </button>
          {/* The bar names where you are; the drawer is where you go. */}
          <span className="min-w-0 flex-1 truncate px-1 text-base font-bold">{currentLabel}</span>
          {primaryAction ? (
            <Link
              href={primaryAction.href}
              aria-label={primaryAction.label}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <PrimaryIcon className="h-5 w-5" strokeWidth={2.6} />
            </Link>
          ) : null}
        </div>

        <main className="pb-[max(env(safe-area-inset-bottom),64px)]">{children}</main>
      </div>
    </>
  );
};
