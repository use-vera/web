"use client";

import { EventDateTile } from "@/components/organizer/event-row";
import { EventStatusBadge } from "@/components/organizer/event-status-badge";
import { DESK, ErrorState, NO_SCROLLBAR, solidOnTone } from "@/components/organizer/organizer-primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { POSTER_TONES, toneFor } from "@/components/vera/event-poster";
import { useOrganizerEvent } from "@/lib/hooks/use-organizer";
import { googleMapsDirectionsUrl } from "@/lib/maps";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BadgePercent,
  ChartNoAxesColumn,
  Download,
  ExternalLink,
  Globe,
  LayoutGrid,
  Loader2,
  Megaphone,
  Package,
  Pencil,
  ScanLine,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const TABS: { segment: string; label: string; icon: LucideIcon }[] = [
  { segment: "", label: "Overview", icon: LayoutGrid },
  { segment: "attendees", label: "Guest list", icon: Users },
  { segment: "check-in", label: "Door", icon: ScanLine },
  { segment: "insights", label: "Insights", icon: ChartNoAxesColumn },
  { segment: "add-ons", label: "Add-ons", icon: Package },
  { segment: "vendors", label: "Vendors", icon: Store },
  { segment: "promo-codes", label: "Promo codes", icon: BadgePercent },
  { segment: "promote", label: "Promote", icon: Megaphone },
  { segment: "exports", label: "Exports", icon: Download },
];

const whenLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));

/* Small round buttons that sit on the event's own colour. */
const HERO_ACTION = "flex h-10 items-center gap-1.5 rounded-full border-[1.5px] border-current px-4 text-sm font-bold transition-colors hover:bg-black/5";

const EventLayout = ({ children }: { children: React.ReactNode }) => {
  const { eventId } = useParams<{ eventId: string }>();
  const pathname = usePathname();
  const base = `/organizer/events/${eventId}`;

  const eventQuery = useOrganizerEvent(eventId);
  const event = eventQuery.data?.event;

  /* The editor is a full form with its own heading and save bar; the tab chrome would only crowd it. */
  if (pathname === `${base}/edit`) {
    return <>{children}</>;
  }

  if (eventQuery.isError) {
    return (
      <div className={DESK}>
        <ErrorState message="Couldn't load this event. It may have been deleted, or you may not have access to it." onRetry={() => eventQuery.refetch()} />
      </div>
    );
  }

  const tone = toneFor(eventId);
  const colours = POSTER_TONES[tone];
  const directions = event ? googleMapsDirectionsUrl({ latitude: event.latitude, longitude: event.longitude, address: event.address }) : null;

  return (
    <div className={DESK}>
      <div className="flex flex-col gap-4 pt-[clamp(16px,2.4vw,32px)]">
        <Link
          href="/organizer/events"
          className="inline-flex h-9 w-fit items-center gap-1.5 rounded-full border-[1.5px] border-border px-3.5 text-[13px] font-semibold transition-colors hover:border-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All events
        </Link>

        <header
          className={cn("flex flex-col gap-4 rounded-[32px] p-2.5 md:flex-row md:items-center", tone === "cream" && "ring-1 ring-border ring-inset")}
          style={{ backgroundColor: colours.bg, color: colours.fg }}
        >
          {event ? <EventDateTile event={event} className="h-24 w-24 rounded-[24px] md:h-28 md:w-28" /> : <Skeleton className="h-24 w-24 rounded-[24px] md:h-28 md:w-28" />}

          <div className="flex min-w-0 flex-1 flex-col gap-2 px-2 md:px-0">
            {eventQuery.isLoading || !event ? (
              <>
                <Skeleton className="h-10 w-72 rounded-2xl" />
                <Skeleton className="h-4 w-96 max-w-full" />
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 style={{ lineHeight: 0.95 }} className="text-[clamp(28px,3.6vw,48px)] font-extrabold tracking-[-0.045em]">
                    {event.name}
                  </h1>
                  <EventStatusBadge event={event} />
                </div>
                <p className="flex flex-wrap items-center gap-x-2 text-[15px] font-semibold opacity-80">
                  <span>{whenLabel(event.nextOccurrenceAt)}</span>
                  <span aria-hidden="true">·</span>
                  {directions ? (
                    <a href={directions} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                      {event.address}
                    </a>
                  ) : (
                    <span>{event.address}</span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{(event.soldTickets || 0).toLocaleString("en-NG")} going</span>
                </p>
              </>
            )}
          </div>

          {event ? (
            <div className="flex flex-wrap items-center gap-2 px-2 pb-2 md:shrink-0 md:px-3 md:pb-0">
              {eventQuery.isFetching && !eventQuery.isLoading ? <Loader2 className="h-4 w-4 animate-spin opacity-60" /> : null}
              {/* The public route only serves published events, so a draft's link would 404. */}
              {event.status === "published" ? (
                <Link href={`/events/${eventId}`} className={HERO_ACTION}>
                  <ExternalLink className="h-4 w-4" />
                  View
                </Link>
              ) : null}
              <Link href={`/organizer/pages/${eventId}`} className={HERO_ACTION}>
                <Globe className="h-4 w-4" />
                Page
              </Link>
              <Link href={`${base}/edit`} style={solidOnTone(tone)} className="flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-opacity hover:opacity-90">
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </div>
          ) : null}
        </header>
      </div>

      {/* Sticky so the sections stay one tap away on a long guest list. Below the phone's top bar on small screens. */}
      <nav aria-label="Event sections" className="sticky top-16 z-20 -mx-[clamp(16px,3vw,40px)] bg-background px-[clamp(16px,3vw,40px)] py-3 lg:top-0">
        <div className={cn("flex gap-2 overflow-x-auto", NO_SCROLLBAR)}>
          {TABS.map((tab) => {
            const href = tab.segment ? `${base}/${tab.segment}` : base;
            const active = pathname === href;
            return (
              <Link
                key={tab.label}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-full border-[1.5px] px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                  active ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:border-foreground",
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="pt-3">{children}</div>
    </div>
  );
};

export default EventLayout;
