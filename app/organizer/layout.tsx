"use client";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
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
import { ArrowLeft, CalendarDays, Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/organizer/events", label: "Events", icon: CalendarDays },
  { href: "/organizer/sales", label: "Sales", icon: TrendingUp },
];

const OrganizerLayout = ({ children }: { children: React.ReactNode }) => {
  const { openAuthModal } = useAuthModal();
  const sessionQuery = useSession();
  const pathname = usePathname();
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
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Sign in to manage your events
          </h1>
          <p className="text-sm text-muted-foreground">
            Create events, sell tickets, scan people in at the door, and see how
            the night went.
          </p>
          <Button
            onClick={() =>
              openAuthModal({ view: "sign-in", redirectTo: "/organizer/events" })
            }
          >
            Sign in
          </Button>
        </div>
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
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
              V
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm leading-tight font-semibold">
                {user.fullName}
              </div>
              <div className="text-xs leading-tight text-muted-foreground">
                Organizer
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="mt-4 px-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
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
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="ticket-perforation-vertical hidden shrink-0 sm:block" />

      {/* Same Lenis opt-out the developer portal needs: this shell scrolls its
          own nested region so the sidebar stays put, and the window has
          nothing to scroll. See app/developers/layout.tsx. */}
      <main data-lenis-prevent className="h-screen flex-1 overflow-y-auto">
        {children}
      </main>
    </SidebarProvider>
  );
};

export default OrganizerLayout;
