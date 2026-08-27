"use client";

import {
  EmptyState,
  ErrorState,
} from "@/components/organizer/organizer-primitives";
import { Pagination } from "@/components/pagination";
import Badge from "@/components/ui/badge";
import Button, { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrganizerField } from "@/components/organizer/organizer-field";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { formatNairaAmount } from "@/lib/format-currency";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useEventTickets, useRefundTicket } from "@/lib/hooks/use-organizer";
import {
  type EventTicketApi,
  type TicketStatusFilter,
} from "@/lib/types/organizer";
import { cn } from "@/lib/utils";
import { Download, Loader2, ScanLine, Search, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 20;

const FILTERS: { value: TicketStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "used", label: "Checked in" },
  { value: "refunded", label: "Refunded" },
];

const StatusBadge = ({ status }: { status: EventTicketApi["status"] }) => {
  if (status === "paid") {
    return (
      <Badge>
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Paid
      </Badge>
    );
  }

  if (status === "used") {
    return <Badge variant="solid">Checked in</Badge>;
  }

  if (status === "refunded" || status === "cancelled") {
    return (
      <Badge
        variant="outline"
        className="border-destructive/60 text-destructive"
      >
        {status === "refunded" ? "Refunded" : "Cancelled"}
      </Badge>
    );
  }

  return <Badge variant="outline">{status === "pending" ? "Pending" : "Expired"}</Badge>;
};

const AttendeesPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [status, setStatus] = useState<TicketStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const ticketsQuery = useEventTickets(eventId, {
    status,
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });
  const refundMutation = useRefundTicket();

  const tickets = ticketsQuery.data?.items ?? [];
  const selected = tickets.find((ticket) => ticket._id === selectedId) ?? null;
  const canRefund =
    selected && (selected.status === "paid" || selected.status === "used");

  const handleRefund = async () => {
    if (!selected) {
      return;
    }

    try {
      await refundMutation.mutateAsync({ ticketId: selected._id });
      toast.success(`Refunded ${selected.attendeeName}`);
      setSelectedId(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't refund that ticket"));
    }
  };

  return (
    <div className="px-8 pt-5.5 pb-8">
      <div className="mb-4.5 flex items-center gap-2.5">
        <div className="relative w-full max-w-[360px]">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <OrganizerField
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, email or reference"
            aria-label="Search attendees"
            className="pl-10"
          />
        </div>

        <div className="inline-flex gap-1 rounded-full bg-muted p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                status === filter.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 gap-2">
          <Link
            href={`/organizer/events/${eventId}/exports`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download className="h-4 w-4" />
            Export
          </Link>
          <Link
            href={`/organizer/events/${eventId}/check-in`}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <ScanLine className="h-4 w-4" />
            Open door mode
          </Link>
        </div>
      </div>

      <Card className="gap-0 py-0">
        {ticketsQuery.isLoading ? (
          <div className="p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="my-2 h-12 w-full rounded-md" />
            ))}
          </div>
        ) : ticketsQuery.isError ? (
          <ErrorState
            message="Couldn't load the attendee list."
            onRetry={() => ticketsQuery.refetch()}
          />
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title={debouncedSearch ? "Nobody matches that" : "No tickets yet"}
            description={
              debouncedSearch
                ? "Try a different name, email or ticket reference."
                : "Attendees appear here as soon as the first ticket sells."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-[32%] px-5 py-3 text-left text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
                      Attendee
                    </th>
                    <th className="w-[16%] px-2 py-3 text-left text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
                      Ticket
                    </th>
                    <th className="w-[16%] px-2 py-3 text-left text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
                      Reference
                    </th>
                    <th className="w-[14%] px-2 py-3 text-left text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
                      Purchased
                    </th>
                    <th className="w-[12%] px-2 py-3 text-left text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
                      Status
                    </th>
                    <th className="w-[10%] px-5 py-3 text-right text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
                      Paid
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      onClick={() =>
                        setSelectedId((current) =>
                          current === ticket._id ? null : ticket._id,
                        )
                      }
                      aria-selected={selectedId === ticket._id}
                      className={cn(
                        "cursor-pointer border-b border-border/60 transition-colors last:border-0",
                        selectedId === ticket._id
                          ? "bg-muted"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground outline outline-foreground/10 -outline-offset-1">
                            {ticket.attendeeName
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold">
                              {ticket.attendeeName}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {ticket.attendeeEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3.5 text-[13px]">
                        {ticket.ticketCategoryName || "General"}
                      </td>
                      <td className="px-2 py-3.5 font-mono text-xs text-muted-foreground">
                        {ticket.ticketCode}
                      </td>
                      <td className="px-2 py-3.5 text-xs text-muted-foreground tabular-nums">
                        {new Intl.DateTimeFormat("en-NG", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(ticket.paidAt || ticket.createdAt))}
                      </td>
                      <td className="px-2 py-3.5">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-semibold tabular-nums">
                        {formatNairaAmount(ticket.totalPriceNaira)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between bg-muted/60 px-5 py-2">
              <Pagination
                page={ticketsQuery.data?.page ?? 1}
                totalPages={ticketsQuery.data?.totalPages ?? 1}
                totalItems={ticketsQuery.data?.totalItems ?? 0}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                noun="attendee"
                className="px-0 py-1.5"
              />

              {selected ? (
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-muted-foreground">
                    {selected.attendeeName}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    disabled={!canRefund || refundMutation.isPending}
                    loading={refundMutation.isPending}
                    onClick={handleRefund}
                  >
                    {canRefund
                      ? `Refund ${formatNairaAmount(selected.totalPriceNaira)}`
                      : "Cannot refund"}
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Select a row to refund
                </span>
              )}
            </div>
          </>
        )}
      </Card>

      {ticketsQuery.isFetching && !ticketsQuery.isLoading ? (
        <div className="mt-3 flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : null}
    </div>
  );
};

export default AttendeesPage;
