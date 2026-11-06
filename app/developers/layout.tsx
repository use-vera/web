"use client";

import MethodBadge from "@/components/developers/method-badge";
import { useHashScroll } from "@/components/developers/use-hash-scroll";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import Wordmark from "@/components/vera/wordmark";
import { GUIDES, GUIDE_SECTIONS } from "@/lib/developer-docs/content";
import { ENDPOINTS, ENDPOINT_GROUPS } from "@/lib/developer-docs/endpoints";
import { useSession } from "@/lib/hooks/use-auth";
import { cn, ROUTES } from "@/lib/utils";
import { ArrowLeft, ArrowUpRight, BookOpen, Code2, House, Key, Menu, PlayCircle, TerminalSquare, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const RAIL_WIDTH = "w-[280px]";

const SECTIONS: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: ROUTES.DEVELOPERS, label: "Overview", icon: House, exact: true },
  { href: ROUTES.DEVELOPERS_DOCS, label: "Docs", icon: BookOpen },
  { href: ROUTES.DEVELOPERS_API, label: "API reference", icon: Code2 },
  { href: ROUTES.DEVELOPERS_SANDBOX, label: "Sandbox", icon: TerminalSquare },
  { href: ROUTES.DEVELOPERS_KEYS, label: "API keys", icon: Key },
];

const SUB_LINK = "flex min-h-9 items-center gap-2.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors";

/**
 * The portal's desk, built like the organizer's: a dark rail on the left, the
 * reading on the light page beside it. The rail names the five places in the
 * portal, then lists what is inside the one you are in (guides in Docs,
 * endpoints in the reference), so the page's own right rail only has to say
 * where you are on the page.
 */
const DevelopersLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const sessionQuery = useSession();
  const user = sessionQuery.data?.user;
  const [navOpen, setNavOpen] = useState(false);
  useHashScroll();

  const isCurrent = (section: (typeof SECTIONS)[number]) =>
    section.exact ? pathname === section.href : pathname === section.href || pathname.startsWith(`${section.href}/`);
  const inDocs = pathname.startsWith(ROUTES.DEVELOPERS_DOCS);
  const inApi = pathname.startsWith(ROUTES.DEVELOPERS_API);
  const currentLabel = SECTIONS.find(isCurrent)?.label ?? "Developers";

  const rail = (onNavigate?: () => void) => (
    <>
      <div className="flex items-center justify-between gap-2 px-2">
        <Link href={ROUTES.DEVELOPERS} aria-label="Developer portal home" onClick={onNavigate}>
          <Wordmark />
        </Link>
        <span className="rounded-full border-[1.5px] border-border px-2.5 py-1 text-xs font-bold text-muted-foreground">Developers</span>
      </div>

      <nav aria-label="Portal" className="mt-7 flex flex-col gap-1">
        {SECTIONS.map((section) => {
          const active = isCurrent(section);
          return (
            <Link
              key={section.href}
              href={section.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-full px-4 text-[15px] font-semibold transition-colors",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <section.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2.2} />
              {section.label}
            </Link>
          );
        })}
      </nav>

      {inDocs ? (
        <nav aria-label="Guides" className="mt-6 flex flex-col gap-5 border-t-[1.5px] border-border pt-5">
          {GUIDE_SECTIONS.map((section) => {
            const guides = GUIDES.filter((guide) => guide.section === section);
            if (!guides.length) {
              return null;
            }
            return (
              <div key={section} className="flex flex-col gap-0.5">
                <span className="mb-1 px-3 text-xs font-bold text-muted-foreground">{section}</span>
                {guides.map((guide) => {
                  const href = `${ROUTES.DEVELOPERS_DOCS}/${guide.slug}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={guide.slug}
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(SUB_LINK, active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", active ? "bg-primary" : "bg-border")} />
                      <span className="min-w-0">{guide.title}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      ) : null}

      {inApi ? (
        <nav aria-label="Endpoints" className="mt-6 flex flex-col gap-5 border-t-[1.5px] border-border pt-5">
          {ENDPOINT_GROUPS.map((group) => (
            <div key={group} className="flex flex-col gap-0.5">
              <span className="mb-1 px-3 text-xs font-bold text-muted-foreground">{group}</span>
              {ENDPOINTS.filter((endpoint) => endpoint.group === group).map((endpoint) => (
                <Link
                  key={endpoint.id}
                  href={`${ROUTES.DEVELOPERS_API}#${endpoint.id}`}
                  onClick={onNavigate}
                  className={cn(SUB_LINK, "text-muted-foreground hover:text-foreground")}
                >
                  <MethodBadge method={endpoint.method} size="sm" />
                  <span className="min-w-0 truncate">{endpoint.summary}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      ) : null}

      <div className="mt-auto flex flex-col gap-1 pt-6">
        <a
          href={ROUTES.DEVELOPERS_DEMO}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center gap-3 rounded-full px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <PlayCircle className="h-4 w-4 shrink-0" />
          Demo app
          <ArrowUpRight className="ml-auto h-3.5 w-3.5" />
        </a>
        <Link
          href="/"
          onClick={onNavigate}
          className="flex h-11 items-center gap-3 rounded-full px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to Vera
        </Link>

        {user ? (
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
        ) : null}
      </div>
    </>
  );

  return (
    <>
      <aside className={cn("dark fixed inset-y-0 left-0 z-40 hidden flex-col overflow-y-auto bg-background p-4 pt-6 text-foreground lg:flex", RAIL_WIDTH)} data-lenis-prevent>
        {rail()}
      </aside>

      {/* Phones and tablets get the rail as a drawer. */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="dark gap-0 overflow-y-auto border-0 bg-background p-4 pt-6 text-foreground data-[side=left]:w-[19rem] data-[side=left]:sm:max-w-[19rem]"
          data-lenis-prevent
        >
          <SheetTitle className="sr-only">Developer portal menu</SheetTitle>
          <SheetDescription className="sr-only">Move between the docs, the API reference, the sandbox and your keys.</SheetDescription>
          <div className="flex min-h-full flex-col">{rail(() => setNavOpen(false))}</div>
        </SheetContent>
      </Sheet>

      <div className="min-h-screen bg-background lg:pl-[280px]">
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
          <span className="min-w-0 flex-1 truncate px-1 text-base font-bold">{currentLabel}</span>
          <span className="rounded-full border-[1.5px] border-border px-2.5 py-1 text-xs font-bold text-muted-foreground">Developers</span>
        </div>

        <main className="pb-[max(env(safe-area-inset-bottom),64px)]">{children}</main>
      </div>
    </>
  );
};

export default DevelopersLayout;
