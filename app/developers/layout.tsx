"use client";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
import Button from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/hooks/use-auth";
import { useCurrentWorkspace } from "@/lib/hooks/use-workspace";
import {
  ArrowLeft,
  BookOpen,
  Key,
  LayoutGrid,
  Loader2,
  TerminalSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/developers", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/developers/keys", label: "API keys", icon: Key },
  { href: "/developers/docs", label: "Documentation", icon: BookOpen },
  { href: "/developers/sandbox", label: "Sandbox", icon: TerminalSquare },
];

const DevelopersLayout = ({ children }: { children: React.ReactNode }) => {
  const { openAuthModal } = useAuthModal();
  const sessionQuery = useSession();
  const pathname = usePathname();
  const isAuthenticated = Boolean(sessionQuery.data?.user);
  const { workspace, isLoading, isError } = useCurrentWorkspace();

  if (sessionQuery.isLoading) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-6">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <TerminalSquare className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Sign in to open the Developer Portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage API keys, read the docs, and test the API once you&apos;re
            signed in.
          </p>
          <Button
            onClick={() =>
              openAuthModal({ view: "sign-in", redirectTo: "/developers" })
            }
          >
            Sign in
          </Button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (isError || !workspace) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-6">
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Couldn&apos;t set up your Developer Portal workspace. Refresh the
          page, or try again shortly.
        </p>
      </main>
    );
  }

  return (
    <SidebarProvider
      className="min-h-screen"
      style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
    >
      <Sidebar collapsible="none" className="hidden h-screen shrink-0 sm:flex">
        <SidebarHeader className="gap-5 px-4 pt-6 pb-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 mt-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href ||
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
      </Sidebar>

      <div className="ticket-perforation-vertical hidden shrink-0 sm:block" />

      {/* The page runs Lenis (see SmoothScrollProvider), which hijacks wheel
          events globally for smooth-scrolling the *window* — but this portal
          scrolls its own nested region instead (so the sidebar stays fixed),
          and the window has nothing to scroll here. Without this attribute
          Lenis intercepts the wheel input and tries to scroll the window,
          so nothing happens. This is Lenis's documented opt-out. */}
      <main
        data-lenis-prevent
        className="h-screen flex-1 overflow-y-auto"
      >
        {children}
      </main>
    </SidebarProvider>
  );
};

export default DevelopersLayout;
