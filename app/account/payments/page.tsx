"use client";

import { EmptyState, ErrorState } from "@/components/organizer/organizer-primitives";
import { Pagination } from "@/components/pagination";
import Badge from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNairaAmount } from "@/lib/format-currency";
import { usePaymentAttempts } from "@/lib/hooks/use-money";
import {
  koboToNaira,
  type PaymentAttemptApi,
  type PaymentAttemptKind,
  type PaymentAttemptStatus,
} from "@/lib/types/money";
import { cn } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import { useState } from "react";

const KIND_LABELS: Record<PaymentAttemptKind, string> = {
  ticket_purchase: "Ticket purchase",
  ticket_resale_purchase: "Resale purchase",
  premium_subscription: "Subscription",
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "ticket_purchase", label: "Tickets" },
  { value: "ticket_resale_purchase", label: "Resale" },
  { value: "premium_subscription", label: "Premium" },
];

const StatusBadge = ({ status }: { status: PaymentAttemptStatus }) => {
  if (status === "success") {
    return (
      <Badge>
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Paid
      </Badge>
    );
  }

  if (status === "failed" || status === "expired") {
    return (
      <Badge variant="outline" className="border-destructive/60 text-destructive">
        {status === "failed" ? "Failed" : "Expired"}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="capitalize">
      {status === "initialized" ? "Started" : status}
    </Badge>
  );
};

const whatOf = (attempt: PaymentAttemptApi) => {
  if (attempt.kind === "premium_subscription") {
    return "Vera Premium";
  }

  return attempt.eventId && typeof attempt.eventId !== "string"
    ? attempt.eventId.name
    : "Event";
};

const PaymentsPage = () => {
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState("all");
  const attemptsQuery = usePaymentAttempts(page, kind);
  const attempts = attemptsQuery.data?.items ?? [];

  return (
    <div className="pb-8">
      <header className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-7">
        <h1 className="text-[26px] leading-tight font-bold tracking-[-0.02em]">
          Payments
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every payment you have started on Vera, whether or not it went through.
        </p>
      </header>

      <div className="px-4 pt-5 sm:px-6 lg:px-4 sm:px-6 lg:px-8">
        <div className="inline-flex gap-1 rounded-full bg-muted p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setKind(filter.value);
                setPage(1);
              }}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                kind === filter.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 sm:px-6 lg:px-4 sm:px-6 lg:px-8">
        <Card className="gap-0 py-0">
          {attemptsQuery.isLoading ? (
            <div className="p-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="my-2 h-11 w-full rounded-md" />
              ))}
            </div>
          ) : attemptsQuery.isError ? (
            <ErrorState
              message="Couldn't load your payments."
              onRetry={() => attemptsQuery.refetch()}
            />
          ) : attempts.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="h-6 w-6" />}
              title="No payments yet"
              description="Tickets you buy and subscriptions you start will show up here."
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        ["What", "w-[30%] px-5 text-left"],
                        ["Kind", "w-[18%] px-2 text-left"],
                        ["When", "w-[16%] px-2 text-left"],
                        ["Reference", "w-[18%] px-2 text-left"],
                        ["Status", "w-[10%] px-2 text-left"],
                        ["Amount", "w-[8%] px-5 text-right"],
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
                    {attempts.map((attempt) => (
                      <tr
                        key={attempt._id}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="truncate px-5 py-3.5 text-[13px] font-semibold">
                          {whatOf(attempt)}
                        </td>
                        <td className="px-2 py-3.5 text-[13px] text-muted-foreground">
                          {KIND_LABELS[attempt.kind]}
                        </td>
                        <td className="px-2 py-3.5 text-xs text-muted-foreground tabular-nums">
                          {new Intl.DateTimeFormat("en-NG", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(attempt.createdAt))}
                        </td>
                        <td className="truncate px-2 py-3.5 font-mono text-xs text-muted-foreground">
                          {attempt.reference}
                        </td>
                        <td className="px-2 py-3.5">
                          <StatusBadge status={attempt.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right text-[13px] font-semibold tabular-nums">
                          {formatNairaAmount(koboToNaira(attempt.amountKobo))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden">
                {attempts.map((attempt) => (
                  <div
                    key={attempt._id}
                    className="flex flex-col gap-2.5 border-b border-border/60 p-4 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {whatOf(attempt)}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {KIND_LABELS[attempt.kind]}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatNairaAmount(koboToNaira(attempt.amountKobo))}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={attempt.status} />
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                        {new Intl.DateTimeFormat("en-NG", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(attempt.createdAt))}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] break-all text-muted-foreground">
                      {attempt.reference}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border bg-muted/60">
                <Pagination
                  page={attemptsQuery.data?.page ?? 1}
                  totalPages={attemptsQuery.data?.totalPages ?? 1}
                  totalItems={attemptsQuery.data?.totalItems ?? 0}
                  pageSize={20}
                  onPageChange={setPage}
                  noun="payment"
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PaymentsPage;
