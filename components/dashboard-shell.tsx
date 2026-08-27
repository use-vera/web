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
import { useSession } from "@/lib/hooks/use-auth";
import { ArrowLeft, Loader2, Settings, type LucideIcon } from "lucide-react";
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
 * different nav — keeping it in a single component means a change to the
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

  const user = sessionQuery.data?.user;

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
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive}
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

        {/* Lenis hijacks wheel events for the window; this shell scrolls its
            own nested region so the sidebar stays put. Lenis's documented
            opt-out. See app/developers/layout.tsx. */}
        <main
          data-lenis-prevent
          className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:h-screen lg:overflow-y-auto lg:pb-0"
        >
          {/* Mobile top bar — the sidebar's identity block, which is hidden
              below lg. Settings lives here because the bottom bar is reserved
              for the three primary destinations. */}
          <div className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-sm lg:hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
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
            <button
              type="button"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {children}
        </main>

        {/* Bottom tab bar — three destinations, thumb-reachable, mirroring the
            Expo app's own navigation so the two platforms feel like one product. */}
        <nav
          aria-label="Sections"
          className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
        >
          {nav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SidebarProvider>
    </>
  );
};
