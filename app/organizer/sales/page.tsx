"use client";

import {
  EmptyState,
  ErrorState,
  Eyebrow,
} from "@/components/organizer/organizer-primitives";
import Badge from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { OrganizerField } from "@/components/organizer/organizer-field";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNairaAmount, formatNairaCompact } from "@/lib/format-currency";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useOrganizerSales } from "@/lib/hooks/use-organizer";
import { type TicketStatusFilter } from "@/lib/types/organizer";
import { Pagination } from "@/components/pagination";
import { cn } from "@/lib/utils";
import { Loader2, Search, TrendingUp } from "lucide-react";
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

  const sales = useMemo(
    () => salesQuery.data?.items ?? [],
    [salesQuery.data],
  );

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
    <div className="pb-8">
      <header className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div>
            <h1 className="text-[26px] leading-tight font-bold tracking-[-0.02em]">
              Sales
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Every ticket sold across your events.
            </p>
          </div>
          <div className="relative w-full sm:w-[260px] sm:shrink-0">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <OrganizerField
              value={search}
              onChange={(input) => {
                setSearch(input.target.value);
                setPage(1);
              }}
              placeholder="Search name or reference"
              aria-label="Search sales"
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <div className="flex gap-8 px-4 pt-5 sm:px-6 lg:px-4 sm:px-6 lg:px-8">
        <div>
          <Eyebrow>Gross</Eyebrow>
          <div className="mt-1 text-[22px] font-bold tracking-[-0.01em] tabular-nums">
            {formatNairaCompact(totals.gross)}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            from tickets loaded here
          </div>
        </div>
        <div>
          <Eyebrow>Seats sold</Eyebrow>
          <div className="mt-1 text-[22px] font-bold tracking-[-0.01em] tabular-nums">
            {totals.seats.toLocaleString("en-NG")}
          </div>
        </div>
        <div>
          <Eyebrow>Refunded</Eyebrow>
          <div className="mt-1 text-[22px] font-bold tracking-[-0.01em] tabular-nums">
            {totals.refunded.toLocaleString("en-NG")}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pt-5 sm:px-6 lg:px-8 lg:pt-6 pb-3.5">
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
        {salesQuery.isFetching && !salesQuery.isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <Card className="gap-0 py-0">
          {salesQuery.isLoading ? (
            <div className="p-5">
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
                  <tr className="border-b border-border">
                    {[
                      ["Buyer", "w-[28%] px-5 text-left"],
                      ["Event", "w-[26%] px-2 text-left"],
                      ["Ticket", "w-[16%] px-2 text-left"],
                      ["Paid on", "w-[14%] px-2 text-left"],
                      ["Status", "w-[10%] px-2 text-left"],
                      ["Amount", "w-[6%] px-5 text-right"],
                    ].map(([label, className]) => (
                      <th
                        key={label}
                        className={cn(
                          "py-3 text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground",
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
                      <td className="px-5 py-3.5">
                        <div className="truncate text-[13px] font-semibold">
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
                        <Badge
                          variant={
                            ticket.status === "used"
                              ? "solid"
                              : ticket.status === "paid"
                                ? "default"
                                : "outline"
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-semibold tabular-nums">
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
                    <Badge
                      variant={
                        ticket.status === "used"
                          ? "solid"
                          : ticket.status === "paid"
                            ? "default"
                            : "outline"
                      }
                      className="capitalize"
                    >
                      {ticket.status}
                    </Badge>
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

            <div className="border-t border-border bg-muted/60">
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
