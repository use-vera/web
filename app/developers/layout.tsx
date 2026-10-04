"use client";

import LogoMark from "@/components/logo-mark";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { GUIDES, GUIDE_SECTIONS } from "@/lib/developer-docs/content";
import { ENDPOINTS, ENDPOINT_GROUPS } from "@/lib/developer-docs/endpoints";
import { ROUTES } from "@/lib/utils";
import { ArrowLeft, Key, TerminalSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* Docs is prose that explains a flow; API is the reference for one
   endpoint. Which of the two the reader is in decides what this sidebar
   lists; the switch itself lives in the right-hand rail, next to the page
   contents, so the left side has one job. */
const TOOL_LINKS = [
  { href: ROUTES.DEVELOPERS_SANDBOX, label: "Sandbox", icon: TerminalSquare },
  { href: ROUTES.DEVELOPERS_KEYS, label: "API keys", icon: Key },
];

const DevelopersLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isApi = pathname.startsWith(ROUTES.DEVELOPERS_API);

  return (
    <SidebarProvider
      className="min-h-screen"
      style={{ "--sidebar-width": "17rem" } as React.CSSProperties}
    >
      <Sidebar collapsible="none" className="hidden h-screen shrink-0 sm:flex">
        <SidebarHeader className="gap-4 px-4 pt-6 pb-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <LogoMark />
            <span className="text-foreground">Developers</span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="mt-2 px-2 pb-8">
          {isApi
            ? ENDPOINT_GROUPS.map((group) => (
                <SidebarGroup key={group}>
                  <SidebarGroupLabel>{group}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {ENDPOINTS.filter(
                        (endpoint) => endpoint.group === group,
                      ).map((endpoint) => (
                        <SidebarMenuItem key={endpoint.id}>
                          <SidebarMenuButton
                            render={
                              <Link
                                href={`${ROUTES.DEVELOPERS_API}#${endpoint.id}`}
                              />
                            }
                          >
                            <span className="truncate">{endpoint.summary}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))
            : GUIDE_SECTIONS.map((section) => (
                <SidebarGroup key={section}>
                  <SidebarGroupLabel>{section}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {GUIDES.filter((guide) => guide.section === section).map(
                        (guide) => {
                          const href = `${ROUTES.DEVELOPERS_DOCS}/${guide.slug}`;

                          return (
                            <SidebarMenuItem key={guide.slug}>
                              <SidebarMenuButton
                                isActive={pathname === href}
                                render={<Link href={href} />}
                              >
                                <span className="truncate">{guide.title}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        },
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}

          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {TOOL_LINKS.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      render={<Link href={item.href} />}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="ticket-perforation-vertical hidden shrink-0 sm:block" />

      <main data-lenis-prevent className="h-screen flex-1 overflow-y-auto ">
        {children}
      </main>
    </SidebarProvider>
  );
};

export default DevelopersLayout;
