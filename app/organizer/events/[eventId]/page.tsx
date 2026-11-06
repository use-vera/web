"use client";

import { MenuTile } from "@/components/header-menu";
import { Meter, Panel, PanelHeader, StatStrip } from "@/components/organizer/organizer-primitives";
import { POSTER_TONES, type PosterTone } from "@/components/vera/event-poster";
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
import Button from "@/components/ui/button";
import {
  ChevronRight,
  Download,
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
  tone: PosterTone;
  title: string;
  description: string;
  href: (eventId: string) => string;
}[] = [
  {
    icon: ScanLine,
    tone: "green",
    title: "Scan people in at the door",
    description: "Open door mode when doors open",
    href: (id) => `/organizer/events/${id}/check-in`,
  },
  {
    icon: Download,
    tone: "blue",
    title: "Build the guest list",
    description: "Export attendees as CSV",
    href: (id) => `/organizer/events/${id}/exports`,
  },
  {
    icon: Megaphone,
    tone: "yellow",
    title: "Feature this event",
    description: "Put it in front of more people",
    href: (id) => `/organizer/events/${id}/promote`,
  },
  {
    icon: Globe,
    tone: "pink",
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
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[118px] rounded-[24px]" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-[28px]" />
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
    <div className="flex flex-col gap-4">
      {event.status === "draft" ? (
        <section
          aria-label="Draft"
          className="flex flex-col items-start gap-4 rounded-[28px] p-[clamp(20px,2.4vw,28px)] sm:flex-row sm:items-center"
          style={{ backgroundColor: POSTER_TONES.yellow.bg, color: POSTER_TONES.yellow.fg }}
        >
          <div className="min-w-0 flex-1">
            <h2 style={{ lineHeight: 1 }} className="text-[clamp(24px,2.6vw,32px)] font-extrabold tracking-[-0.035em]">
              still a draft.
            </h2>
            <p className="mt-1.5 max-w-xl text-[15px] font-medium opacity-80">
              Nobody can find it, open it, or buy a ticket until you publish. Everything is already set up, and publishing puts it on sale straight away.
            </p>
          </div>
          <Button variant="ink" className="shrink-0 bg-[#16150F] text-[#F5F3EF]" loading={publishEvent.isPending} onClick={publish}>
            Publish event
          </Button>
        </section>
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
            note: "from the latest 50 tickets",
          },
          {
            label: "Admitted",
            value: derived.admitted.toLocaleString("en-NG"),
            note: daysToDoors > 0 ? `doors open in ${daysToDoors} ${daysToDoors === 1 ? "day" : "days"}` : "doors have opened",
          },
          {
            label: "On resale",
            value: derived.listed.toLocaleString("en-NG"),
            note: "listed by buyers",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel>
          <PanelHeader
            title="Sales this week"
            description={`${weekTotal} ${weekTotal === 1 ? "ticket" : "tickets"} in the last 7 days`}
            action={<span className="text-[13px] font-semibold text-muted-foreground">Tickets per day</span>}
          />
          <div className="px-5 pb-5 sm:px-6">
            {ticketsQuery.isLoading ? <Skeleton className="h-[170px] w-full rounded-[20px]" /> : <SalesBarChart points={week} />}
          </div>
          <div className="border-t-[1.5px] border-dashed border-border px-5 py-4 sm:px-6">
            <div className="mb-2.5 flex justify-between text-sm font-bold tabular-nums">
              <span>{sold.toLocaleString("en-NG")} sold</span>
              <span className="text-muted-foreground">
                {percent}% · {remaining.toLocaleString("en-NG")} left
              </span>
            </div>
            <Meter percent={percent} className="h-2.5" />
          </div>
        </Panel>

        <Panel className="flex flex-col">
          <PanelHeader title="Before doors open" description="Where to go next on this event." />
          <div className="flex flex-col gap-1 px-2.5 pb-2.5">
            {NEXT_STEPS.map((step) => (
              <Link
                key={step.title}
                href={step.href(eventId)}
                className="group flex items-center gap-3.5 rounded-[18px] p-2.5 transition-colors hover:bg-secondary"
              >
                <MenuTile icon={step.icon} tone={step.tone} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold">{step.title}</span>
                  <span className="block text-[13px] text-muted-foreground">{step.description}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
          <p className="mt-auto flex items-center gap-2.5 border-t-[1.5px] border-dashed border-border px-5 py-4 text-[13px] text-muted-foreground sm:px-6">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            Cancelling refunds every ticket automatically.
          </p>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Latest tickets"
          action={
            <Link href={`${base}/attendees`} className="flex h-9 items-center rounded-full border-[1.5px] border-border px-3.5 text-[13px] font-semibold transition-colors hover:border-foreground">
              See all {derived.sampled.toLocaleString("en-NG")}
            </Link>
          }
        />
        <div className="px-2.5 pb-2.5">
          {ticketsQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="m-2.5 h-10 rounded-2xl" />)
          ) : tickets.length === 0 ? (
            <p className="px-2.5 pb-4 text-[15px] text-muted-foreground">No tickets sold yet.</p>
          ) : (
            tickets.slice(0, 5).map((ticket) => (
              <div key={ticket._id} className="flex items-center gap-3 rounded-[18px] px-2.5 py-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                  {ticket.attendeeName
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px]">
                  <span className="font-bold">{ticket.attendeeName}</span>{" "}
                  <span className="text-muted-foreground">
                    bought {ticket.quantity} &times; {ticket.ticketCategoryName || "ticket"}
                  </span>
                </span>
                <span className="shrink-0 text-[15px] font-bold tabular-nums">{formatNairaCompact(ticket.totalPriceNaira)}</span>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
};

export default EventOverviewPage;
