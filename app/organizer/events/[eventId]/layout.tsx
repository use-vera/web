"use client";

import { EventStatusBadge } from "@/components/organizer/event-status-badge";
import { ErrorState } from "@/components/organizer/organizer-primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizerEvent } from "@/lib/hooks/use-organizer";
import { cn } from "@/lib/utils";
import { ArrowLeft, Clock, Loader2, MapPin, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

const TABS = [
  { segment: "", label: "Overview" },
  { segment: "attendees", label: "Attendees" },
  { segment: "check-in", label: "Check-in" },
  { segment: "insights", label: "Insights" },
  { segment: "exports", label: "Exports" },
  { segment: "promote", label: "Promote" },
];

const EventLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ eventId: string }>();
  const pathname = usePathname();
  const eventId = params.eventId;
  const base = `/organizer/events/${eventId}`;

  const eventQuery = useOrganizerEvent(eventId);
  const event = eventQuery.data?.event;

  if (eventQuery.isError) {
    return (
      <ErrorState
        message="Couldn't load this event. It may have been deleted, or you may not have access to it."
        onRetry={() => eventQuery.refetch()}
      />
    );
  }

  return (
    <div>
      <header className="px-8 pt-6">
        <Link
          href="/organizer/events"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Events
        </Link>

        <div className="mt-3.5 flex items-start justify-between gap-6">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted text-muted-foreground outline outline-foreground/10 -outline-offset-1">
              {event?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <Ticket className="h-[22px] w-[22px]" />
              )}
            </div>

            <div className="min-w-0">
              {eventQuery.isLoading || !event ? (
                <>
                  <Skeleton className="h-7 w-64" />
                  <Skeleton className="mt-2.5 h-4 w-96" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <h1 className="truncate text-2xl leading-tight font-bold tracking-[-0.02em]">
                      {event.name}
                    </h1>
                    <EventStatusBadge event={event} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-[13px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.address}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {new Intl.DateTimeFormat("en-NG", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }).format(new Date(event.nextOccurrenceAt))}
                    </span>
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <Users className="h-3.5 w-3.5" />
                      {(event.soldTickets || 0).toLocaleString("en-NG")} going
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {eventQuery.isFetching && !eventQuery.isLoading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          ) : null}
        </div>

        <nav className="mt-5 flex gap-6" aria-label="Event sections">
          {TABS.map((tab) => {
            const href = tab.segment ? `${base}/${tab.segment}` : base;
            const isActive = pathname === href;

            return (
              <Link
                key={tab.label}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "border-b-2 pb-3 text-sm transition-colors",
                  isActive
                    ? "border-primary font-semibold text-foreground"
                    : "border-transparent font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <hr className="ticket-perforation" />

      {children}
    </div>
  );
};

export default EventLayout;
