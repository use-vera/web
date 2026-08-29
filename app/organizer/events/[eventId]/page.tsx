"use client";

import {
  Meter,
  StatStrip,
} from "@/components/organizer/organizer-primitives";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesBarChart } from "@/components/organizer/sales-bar-chart";
import { buildDailySeries } from "@/lib/organizer-series";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { daysUntil } from "@/lib/event-status";
import { formatNairaCompact } from "@/lib/format-currency";
import {
  useEventTickets,
  useOrganizerEvent,
  useUpdateEvent,
} from "@/lib/hooks/use-organizer";
import Button, { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Download,
  ExternalLink,
  Globe,
  Megaphone,
  ScanLine,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

const NEXT_STEPS: {
  icon: typeof ScanLine;
  title: string;
  description: string;
  href: (eventId: string) => string;
}[] = [
  {
    icon: ScanLine,
    title: "Scan people in at the door",
    description: "Open door mode when doors open",
    href: (id) => `/organizer/events/${id}/check-in`,
  },
  {
    icon: Download,
    title: "Build the guest list",
    description: "Export attendees as CSV",
    href: (id) => `/organizer/events/${id}/exports`,
  },
  {
    icon: Megaphone,
    title: "Feature this event",
    description: "Put it in front of more people",
    href: (id) => `/organizer/events/${id}/promote`,
  },
  {
    icon: Globe,
    title: "Build a page for it",
    description: "Your own address at vera.tickets",
    /* Outside the event's tab chrome. It is a full-screen editor. */
    href: (id) => `/organizer/pages/${id}`,
  },
];

const EventOverviewPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const eventQuery = useOrganizerEvent(eventId);
  const event = eventQuery.data?.event;

  /**
   * Admissions and refunds aren't summarised by the backend, so the overview
   * reads them off one page of tickets. It is a sample, not the full ledger.
   * The attendees tab is the authoritative list.
   */
  const ticketsQuery = useEventTickets(eventId, { limit: 50 });
  const tickets = useMemo(
    () => ticketsQuery.data?.items ?? [],
    [ticketsQuery.data],
  );

  const publishEvent = useUpdateEvent(eventId);

  const publish = async () => {
    try {
      await publishEvent.mutateAsync({ status: "published" });
      toast.success("Event published. It is on sale now");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't publish that event"));
    }
  };

  const derived = useMemo(() => {
    const admitted = tickets.filter((ticket) => ticket.status === "used").length;
    const listed = tickets.filter(
      (ticket) => ticket.resaleStatus && ticket.resaleStatus !== "none",
    ).length;
    const gross = tickets
      .filter((ticket) => ticket.status === "paid" || ticket.status === "used")
      .reduce((sum, ticket) => sum + (ticket.totalPriceNaira || 0), 0);

    return { admitted, listed, gross, sampled: ticketsQuery.data?.totalItems ?? 0 };
  }, [tickets, ticketsQuery.data]);

  const week = useMemo(() => buildDailySeries(tickets, 7), [tickets]);
  const weekTotal = useMemo(
    () => week.reduce((sum, point) => sum + point.value, 0),
    [week],
  );

  if (eventQuery.isLoading || !event) {
    return (
      <div className="flex flex-col gap-3.5 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <Skeleton className="h-[92px] w-full rounded-sm" />
        <Skeleton className="h-[280px] w-full rounded-sm" />
      </div>
    );
  }

  const capacity = event.expectedTickets || 0;
  const sold = event.soldTickets || 0;
  const remaining = event.remainingTickets ?? Math.max(0, capacity - sold);
  const percent = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  const base = `/organizer/events/${eventId}`;
  const daysToDoors = daysUntil(event.nextOccurrenceAt);

  return (
    <div className="flex flex-col gap-3.5 px-4 py-5 pb-8 sm:px-6 lg:px-8 lg:py-6">
      {event.status === "draft" ? (
        <Card className="flex-col items-start gap-4 border-0 bg-accent p-5 shadow-[inset_0_0_0_2px_var(--primary)] sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-accent-foreground">
              This event is still a draft
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-pretty text-accent-foreground/85">
              Nobody can find it, open it, or buy a ticket until you publish.
              Everything is already set up. Publishing puts it on sale
              straight away.
            </p>
          </div>
          <Button
            className="shrink-0"
            loading={publishEvent.isPending}
            onClick={publish}
          >
            Publish event
          </Button>
        </Card>
      ) : null}

      <StatStrip
        cells={[
          {
            label: "Tickets issued",
            value: sold.toLocaleString("en-NG"),
            note: `${remaining.toLocaleString("en-NG")} left of ${capacity.toLocaleString("en-NG")}`,
          },
          {
            label: "Gross sales",
            value: formatNairaCompact(derived.gross),
            note: "from tickets loaded here",
          },
          {
            label: "Admitted",
            value: derived.admitted.toLocaleString("en-NG"),
            note:
              daysToDoors > 0
                ? `doors open in ${daysToDoors} ${daysToDoors === 1 ? "day" : "days"}`
                : "doors are open",
          },
          {
            label: "On resale",
            value: derived.listed.toLocaleString("en-NG"),
            note: "listed by buyers",
          },
        ]}
      />

      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-stretch">
        <Card className="min-w-0 flex-1 gap-0 py-0">
          <div className="flex items-baseline justify-between px-5 py-4">
            <div>
              <div className="text-base leading-snug font-semibold">
                Sales this week
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                {weekTotal} {weekTotal === 1 ? "ticket" : "tickets"} in the last
                7 days
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Tickets per day
            </span>
          </div>
          <div className="px-5 pb-4">
            {ticketsQuery.isLoading ? (
              <Skeleton className="h-[170px] w-full rounded-md" />
            ) : (
              <SalesBarChart points={week} />
            )}
          </div>
          <hr className="ticket-perforation" />
          <div className="px-5 py-3.5">
            <Meter percent={percent} className="h-2" />
            <div className="mt-2.5 flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{sold.toLocaleString("en-NG")} sold</span>
              <span>{remaining.toLocaleString("en-NG")} left</span>
            </div>
          </div>
        </Card>

        <Card className="w-full lg:w-[360px] lg:shrink-0 gap-0 py-0">
          <div className="px-5 py-4">
            <div className="text-base leading-snug font-semibold">
              Before doors open
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Where to go next on this event.
            </div>
          </div>
          <hr className="ticket-perforation" />
          <div className="flex flex-col px-3 py-1.5">
            {NEXT_STEPS.map((step) => (
              <Link
                key={step.title}
                href={step.href(eventId)}
                className="flex items-center gap-3 rounded-sm px-2 py-3 transition-colors hover:bg-muted/60"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <step.icon className="h-[15px] w-[15px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold">
                    {step.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {step.description}
                  </span>
                </span>
                <ChevronRight className="h-[15px] w-[15px] shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2.5 bg-muted/50 px-5 py-3.5">
            <TriangleAlert className="h-[15px] w-[15px] shrink-0 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Cancelling refunds every ticket automatically.
            </span>
          </div>
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="text-base leading-snug font-semibold">
            Latest tickets
          </div>
          <Link
            href={`${base}/attendees`}
            className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            See all {derived.sampled.toLocaleString("en-NG")}
          </Link>
        </div>
        <hr className="ticket-perforation" />
        <div className="px-5 pt-1 pb-3">
          {ticketsQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="my-2.5 h-10 w-full rounded-md" />
            ))
          ) : tickets.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No tickets sold yet.
            </p>
          ) : (
            tickets.slice(0, 4).map((ticket) => (
              <div
                key={ticket._id}
                className="flex items-center gap-3 py-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground outline outline-foreground/10 -outline-offset-1">
                  {ticket.attendeeName
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="min-w-0 flex-1 text-[13px]">
                  <span className="font-semibold">{ticket.attendeeName}</span>{" "}
                  <span className="text-muted-foreground">
                    bought {ticket.quantity} &times;{" "}
                    {ticket.ticketCategoryName || "ticket"}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                  {formatNairaCompact(ticket.totalPriceNaira)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        {/* The public route only serves published events, so a draft's link
            would 404. */}
        {event.status === "published" ? (
          <Link
            href={`/events/${eventId}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <ExternalLink className="h-4 w-4" />
            View public page
          </Link>
        ) : null}
        <Link
          href={`${base}/check-in`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <ScanLine className="h-4 w-4" />
          Open door mode
        </Link>
      </div>
    </div>
  );
};

export default EventOverviewPage;
