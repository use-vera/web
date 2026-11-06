"use client";

import { EmptyState, ErrorState, FilterPills, Panel, SearchField, TABLE_HEAD } from "@/components/organizer/organizer-primitives";
import { Pagination } from "@/components/pagination";
import { TicketStatusBadge } from "@/components/organizer/ticket-status-badge";
import Button, { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { formatNairaAmount } from "@/lib/format-currency";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useEventTickets, useRefundTicket } from "@/lib/hooks/use-organizer";
import { type TicketStatusFilter } from "@/lib/types/organizer";
import { cn } from "@/lib/utils";
import { Download, Loader2, ScanLine, Users } from "lucide-react";
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchField
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search name, email or reference"
          aria-label="Search the guest list"
          className="w-full lg:max-w-[360px]"
        />
        <FilterPills
          label="Filter by ticket status"
          options={FILTERS}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        <div className="flex gap-2 lg:ml-auto lg:shrink-0">
          <Link href={`/organizer/events/${eventId}/exports`} className={cn(buttonVariants({ variant: "line", size: "sm" }), "h-10")}>
            <Download className="h-4 w-4" />
            Export
          </Link>
          <Link href={`/organizer/events/${eventId}/check-in`} className={cn(buttonVariants({ variant: "ink", size: "sm" }), "h-10")}>
            <ScanLine className="h-4 w-4" />
            Door mode
          </Link>
        </div>
      </div>

      <Panel>
        {ticketsQuery.isLoading ? (
          <div className="p-4 sm:p-5">
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
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="border-b-[1.5px] border-border">
                    <th className={cn(TABLE_HEAD, "w-[32%] px-5 sm:px-6 text-left")}>
                      Attendee
                    </th>
                    <th className={cn(TABLE_HEAD, "w-[16%] px-2 py-3 text-left")}>
                      Ticket
                    </th>
                    <th className={cn(TABLE_HEAD, "w-[16%] px-2 py-3 text-left")}>
                      Reference
                    </th>
                    <th className={cn(TABLE_HEAD, "w-[14%] px-2 py-3 text-left")}>
                      Purchased
                    </th>
                    <th className={cn(TABLE_HEAD, "w-[12%] px-2 py-3 text-left")}>
                      Status
                    </th>
                    <th className={cn(TABLE_HEAD, "w-[10%] px-5 sm:px-6 text-right")}>
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
                          ? "bg-secondary"
                          : "hover:bg-secondary/60",
                      )}
                    >
                      <td className="px-5 py-3.5 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                            {ticket.attendeeName
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold">
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
                        <TicketStatusBadge status={ticket.status} />
                      </td>
                      <td className="px-5 py-3.5 sm:px-6 text-right text-[13px] font-semibold tabular-nums">
                        {formatNairaAmount(ticket.totalPriceNaira)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden">
              {tickets.map((ticket) => (
                <button
                  key={ticket._id}
                  type="button"
                  onClick={() =>
                    setSelectedId((current) =>
                      current === ticket._id ? null : ticket._id,
                    )
                  }
                  aria-pressed={selectedId === ticket._id}
                  className={cn(
                    "flex w-full flex-col gap-2.5 border-b border-border/60 p-4 text-left transition-colors last:border-0",
                    selectedId === ticket._id ? "bg-secondary" : "active:bg-secondary/60",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                      {ticket.attendeeName
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {ticket.attendeeName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {ticket.attendeeEmail}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatNairaAmount(ticket.totalPriceNaira)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <TicketStatusBadge status={ticket.status} />
                    <span className="text-xs text-muted-foreground">
                      {ticket.ticketCategoryName || "General"}
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                      {ticket.ticketCode}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-border px-5 py-2 sm:px-6">
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
                    variant="line"
                    className="h-9 text-[13px]"
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
      </Panel>

      {ticketsQuery.isFetching && !ticketsQuery.isLoading ? (
        <div className="mt-3 flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : null}
    </div>
  );
};

export default AttendeesPage;
