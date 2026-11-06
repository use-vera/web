"use client";

import {
  DESK,
  EmptyState,
  ErrorState,
  FilterPills,
  PageHeader,
  PANEL,
  SearchField,
  StatStrip,
} from "@/components/organizer/organizer-primitives";
import { TicketStatusBadge } from "@/components/organizer/ticket-status-badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNairaAmount, formatNairaCompact } from "@/lib/format-currency";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useOrganizerSales } from "@/lib/hooks/use-organizer";
import { type TicketStatusFilter } from "@/lib/types/organizer";
import { Pagination } from "@/components/pagination";
import { cn } from "@/lib/utils";
import { Loader2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

const PAGE_SIZE = 20;

const FILTERS: { value: TicketStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "used", label: "Checked in" },
  { value: "refunded", label: "Refunded" },
];

const eventNameOf = (eventId: unknown) =>
  typeof eventId === "string" || !eventId
    ? "-"
    : (eventId as { name?: string }).name || "-";

const SalesPage = () => {
  const [status, setStatus] = useState<TicketStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const salesQuery = useOrganizerSales({
    status,
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });

  const sales = useMemo(() => salesQuery.data?.items ?? [], [salesQuery.data]);

  const totals = useMemo(() => {
    const settled = sales.filter(
      (ticket) => ticket.status === "paid" || ticket.status === "used",
    );

    return {
      gross: settled.reduce(
        (sum, ticket) => sum + (ticket.totalPriceNaira || 0),
        0,
      ),
      seats: settled.reduce((sum, ticket) => sum + (ticket.quantity || 1), 0),
      refunded: sales.filter((ticket) => ticket.status === "refunded").length,
    };
  }, [sales]);

  return (
    <div className={DESK}>
      <PageHeader
        lead="every"
        accent="sale."
        description="Every ticket sold across your events, newest first."
        actions={
          <SearchField
            value={search}
            onChange={(input) => {
              setSearch(input.target.value);
              setPage(1);
            }}
            placeholder="Search name or reference"
            aria-label="Search sales"
            className="w-full sm:w-[300px]"
          />
        }
      />

      <div className="flex flex-col gap-4">
        {salesQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[118px] rounded-[24px]" />
            ))}
          </div>
        ) : (
          <StatStrip
            cells={[
              {
                label: "Gross on this page",
                value: formatNairaCompact(totals.gross),
                note: "paid and checked-in tickets",
              },
              {
                label: "Seats sold",
                value: totals.seats.toLocaleString("en-NG"),
                note: "on this page",
              },
              {
                label: "Refunded",
                value: totals.refunded.toLocaleString("en-NG"),
                note: "on this page",
                tone: "pink",
              },
            ]}
          />
        )}

        <div className="flex items-center justify-between gap-3">
          <FilterPills
            label="Filter by status"
            options={FILTERS}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
          {salesQuery.isFetching && !salesQuery.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>

        <Card className={cn(PANEL, "gap-0 py-0")}>
          {salesQuery.isLoading ? (
            <div className="p-4 sm:p-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="my-2 h-12 w-full rounded-md" />
              ))}
            </div>
          ) : salesQuery.isError ? (
            <ErrorState
              message="Couldn't load your sales."
              onRetry={() => salesQuery.refetch()}
            />
          ) : sales.length === 0 ? (
            <EmptyState
              icon={<TrendingUp className="h-6 w-6" />}
              title={debouncedSearch ? "Nothing matches that" : "No sales yet"}
              description={
                debouncedSearch
                  ? "Try a different name or ticket reference."
                  : "Tickets show up here the moment someone buys one."
              }
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="border-b-[1.5px] border-border">
                      {[
                        ["Buyer", "w-[28%] px-5 text-left sm:px-6"],
                        ["Event", "w-[24%] px-2 text-left"],
                        ["Ticket", "w-[16%] px-2 text-left"],
                        ["Paid on", "w-[14%] px-2 text-left"],
                        ["Status", "w-[10%] px-2 text-left"],
                        ["Amount", "w-[10%] px-5 text-right sm:px-6"],
                      ].map(([label, className]) => (
                        <th
                          key={label}
                          className={cn(
                            "py-3 text-[13px] font-semibold text-muted-foreground",
                            className,
                          )}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((ticket) => (
                      <tr
                        key={ticket._id}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="px-5 py-3.5 sm:px-6">
                          <div className="truncate text-sm font-bold">
                            {ticket.attendeeName}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {ticket.attendeeEmail}
                          </div>
                        </td>
                        <td className="truncate px-2 py-3.5 text-[13px]">
                          {eventNameOf(ticket.eventId)}
                        </td>
                        <td className="truncate px-2 py-3.5 text-[13px]">
                          {ticket.ticketCategoryName || "General"}
                        </td>
                        <td className="px-2 py-3.5 text-xs text-muted-foreground tabular-nums">
                          {ticket.paidAt
                            ? new Intl.DateTimeFormat("en-NG", {
                                day: "numeric",
                                month: "short",
                              }).format(new Date(ticket.paidAt))
                            : "-"}
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
                {sales.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="flex flex-col gap-2.5 border-b border-border/60 p-4 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {ticket.attendeeName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {eventNameOf(ticket.eventId)}
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
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                        {ticket.paidAt
                          ? new Intl.DateTimeFormat("en-NG", {
                              day: "numeric",
                              month: "short",
                            }).format(new Date(ticket.paidAt))
                          : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-[1.5px] border-border px-5 sm:px-6">
                <Pagination
                  page={salesQuery.data?.page ?? 1}
                  totalPages={salesQuery.data?.totalPages ?? 1}
                  totalItems={salesQuery.data?.totalItems ?? 0}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                  noun="ticket"
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SalesPage;
