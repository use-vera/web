"use client";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { SettingsDialog } from "@/components/settings-dialog";
import Button from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSession } from "@/lib/hooks/use-auth";
import { ArrowLeft, Loader2, Menu, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
  signedOutTitle: string;
  signedOutDescription: string;
  signedOutIcon: ReactNode;
  redirectTo: string;
  children: ReactNode;
}

/**
 * The one dashboard layout. /organizer and /account are the same chrome with
 * different nav. Keeping it in a single component means a change to the
 * sidebar, the tear divider or the scroll behaviour lands in both by
 * construction rather than by remembering to.
 */
export const DashboardShell = ({
  nav,
  role,
  signedOutTitle,
  signedOutDescription,
  signedOutIcon,
  redirectTo,
  children,
}: DashboardShellProps) => {
  const { openAuthModal } = useAuthModal();
  const sessionQuery = useSession();
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const user = sessionQuery.data?.user;

  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  /* Deepest match wins, so /organizer/events does not resolve to /organizer. */
  const currentLabel =
    [...nav]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => isCurrent(item.href))?.label ?? role;

  if (sessionQuery.isLoading) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-6">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
            {signedOutIcon}
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {signedOutTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {signedOutDescription}
          </p>
          <Button onClick={() => openAuthModal({ view: "sign-in", redirectTo })}>
            Sign in
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      <SidebarProvider
        className="min-h-screen"
        style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
      >
        <Sidebar collapsible="none" className="hidden h-screen shrink-0 lg:flex">
          <SidebarHeader className="gap-5 px-4 pt-6 pb-2">
            <div className="flex items-center gap-2.5 px-1">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  "V"
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm leading-tight font-semibold">
                  {user.fullName}
                </span>
                <span className="block text-xs leading-tight text-muted-foreground">
                  {role}
                </span>
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="mt-4 px-2">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {nav.map((item) => {
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isCurrent(item.href)}
                          render={<Link href={item.href} />}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-2 pb-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/" />}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Vera
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setSettingsOpen(true)}>
                  <Settings className="h-4 w-4" />
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="ticket-perforation-vertical hidden shrink-0 lg:block" />

        {/* A drawer rather than a tab bar. It opens from the same edge the
            desktop sidebar occupies, it holds a nav of any length, and it
            gives back the 72px a fixed bottom bar reserved on every screen. */}
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="gap-0 p-0 data-[side=left]:w-[17.5rem] data-[side=left]:sm:max-w-[17.5rem]"
          >
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Move between sections of your {role.toLowerCase()} area.
            </SheetDescription>

            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  "V"
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm leading-tight font-semibold">
                  {user.fullName}
                </span>
                <span className="block text-xs leading-tight text-muted-foreground">
                  {role}
                </span>
              </span>
            </div>

            <nav aria-label="Sections" className="flex flex-col gap-0.5 p-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  onClick={() => setNavOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 text-[13.5px] font-semibold transition-colors",
                    isCurrent(item.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-0.5 border-t border-border p-2">
              <button
                type="button"
                onClick={() => {
                  setNavOpen(false);
                  setSettingsOpen(true);
                }}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings className="h-4 w-4 shrink-0" strokeWidth={2} />
                Settings
              </button>
              <Link
                href="/"
                onClick={() => setNavOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-md px-3 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
                Back to Vera
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        {/* Lenis hijacks wheel events for the window; this shell scrolls its
            own nested region so the sidebar stays put. Lenis's documented
            opt-out. See app/developers/layout.tsx. */}
        <main
          data-lenis-prevent
          className="min-w-0 flex-1 pb-[env(safe-area-inset-bottom)] lg:h-screen lg:overflow-y-auto lg:pb-0"
        >
          <div className="sticky top-0 z-30 flex h-12 items-center gap-1 border-b border-border bg-background/90 px-2 backdrop-blur-sm lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(true)}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.96]"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
            {/* The bar names where you are; the drawer is where you go. */}
            <span className="min-w-0 flex-1 truncate px-1 text-[15px] font-bold">
              {currentLabel}
            </span>
            <button
              type="button"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.96]"
            >
              <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
          </div>

          {children}
        </main>
      </SidebarProvider>
    </>
  );
};
