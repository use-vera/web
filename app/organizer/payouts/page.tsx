"use client";

import {
  EmptyState,
  ErrorState,
  Eyebrow,
  PerforationY,
} from "@/components/organizer/organizer-primitives";
import { Pagination } from "@/components/pagination";
import Badge from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNairaAmount, formatNairaCompact } from "@/lib/format-currency";
import { usePayoutAccount, useWallet, useWalletTransactions } from "@/lib/hooks/use-money";
import {
  koboToNaira,
  type WalletTransactionApi,
  type WalletTransactionType,
} from "@/lib/types/money";
import { cn } from "@/lib/utils";
import { Check, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TYPE_LABELS: Record<WalletTransactionType, string> = {
  ticket_sale: "Ticket sale",
  platform_fee: "Platform fee",
  refund: "Refund",
  chargeback: "Chargeback",
  settlement: "Settlement",
  withdrawal: "Withdrawal",
  withdrawal_reversal: "Withdrawal reversed",
  adjustment: "Adjustment",
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "ticket_sale", label: "Sales" },
  { value: "platform_fee", label: "Fees" },
  { value: "withdrawal", label: "Withdrawals" },
];

const eventNameOf = (eventId: WalletTransactionApi["eventId"]) =>
  eventId && typeof eventId !== "string" ? eventId.name : null;

/** "Platform fee for Afrobeats Night" — the bare label when no event is tied. */
const titleOf = (transaction: WalletTransactionApi) => {
  const label = TYPE_LABELS[transaction.type] ?? "Transaction";
  const eventName = eventNameOf(transaction.eventId);

  return eventName ? `${label} for ${eventName}` : label;
};

const Balance = ({
  label,
  kobo,
  note,
  strong,
}: {
  label: string;
  kobo: number;
  note: string;
  strong?: boolean;
}) => (
  <div className="flex-1 px-5 py-[18px]">
    <Eyebrow>{label}</Eyebrow>
    <div
      className={cn(
        "mt-[5px] font-bold tracking-[-0.02em] tabular-nums",
        strong ? "text-[28px]" : "text-[22px] text-muted-foreground",
      )}
    >
      {formatNairaAmount(koboToNaira(kobo))}
    </div>
    <div className="mt-[3px] text-xs text-muted-foreground">{note}</div>
  </div>
);

const PayoutsPage = () => {
  const [page, setPage] = useState(1);
  const [type, setType] = useState("all");

  const walletQuery = useWallet();
  const accountQuery = usePayoutAccount();
  const transactionsQuery = useWalletTransactions(page, type);

  const wallet = walletQuery.data;
  const account = accountQuery.data;
  const transactions = transactionsQuery.data?.items ?? [];

  return (
    <div className="pb-8">
      <header className="px-8 pt-7">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[26px] leading-tight font-bold tracking-[-0.02em]">
              Payouts
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              What you have earned, what has cleared, and what is on its way to
              your bank.
            </p>
          </div>
          <Link
            href="/organizer/payouts/withdraw"
            className={cn(buttonVariants(), "shrink-0")}
          >
            <Wallet className="h-4 w-4" />
            Withdraw
          </Link>
        </div>
      </header>

      <div className="px-8 pt-5.5">
        {walletQuery.isLoading ? (
          <Skeleton className="h-[104px] w-full rounded-sm" />
        ) : walletQuery.isError || !wallet ? (
          <ErrorState
            message="Couldn't load your wallet."
            onRetry={() => walletQuery.refetch()}
          />
        ) : (
          <Card className="flex-row items-stretch gap-0 py-0">
            <Balance
              label="Available"
              kobo={wallet.availableBalanceKobo}
              note="ready to withdraw now"
              strong
            />
            <PerforationY />
            <Balance
              label="Pending"
              kobo={wallet.pendingBalanceKobo}
              note="clears after each event"
            />
            <PerforationY />
            <Balance
              label="Reserved"
              kobo={wallet.reservedBalanceKobo}
              note="withdrawal in flight"
            />
            <PerforationY />
            <Balance
              label="Owing"
              kobo={wallet.owingBalanceKobo}
              note="refunds to recover"
            />
          </Card>
        )}
      </div>

      {account ? (
        <div className="px-8 pt-3.5">
          <Card className="flex-row items-center gap-4 px-5 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Check className="h-[17px] w-[17px]" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">
                {account.bankName} ••••{account.accountNumber.slice(-4)} ·{" "}
                {account.accountName}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Payouts land in 24–48 hours
              </div>
            </div>
            <Badge variant={account.kycStatus === "verified" ? "default" : "outline"}>
              {account.kycStatus === "verified" ? "Verified" : account.kycStatus}
            </Badge>
          </Card>
        </div>
      ) : accountQuery.isLoading ? null : (
        <div className="px-8 pt-3.5">
          <Card className="flex-row items-center gap-4 px-5 py-3.5">
            <div className="min-w-0 flex-1 text-[13px] text-muted-foreground">
              No payout account yet. Add one before you can withdraw.
            </div>
            <Link
              href="/organizer/payouts/withdraw"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Add account
            </Link>
          </Card>
        </div>
      )}

      {wallet ? (
        <div className="flex gap-8 px-8 pt-5">
          {[
            ["Lifetime sales", wallet.lifetimeGrossSalesKobo, false],
            ["Platform fees", wallet.lifetimePlatformFeesKobo, true],
            ["Withdrawn", wallet.lifetimeWithdrawnKobo, false],
            ["Refunded", wallet.lifetimeRefundedKobo, true],
          ].map(([label, kobo, negative]) => (
            <div key={String(label)}>
              <Eyebrow>{label}</Eyebrow>
              <div className="mt-1 text-lg font-bold tabular-nums">
                {negative ? "−" : ""}
                {formatNairaCompact(koboToNaira(Number(kobo)))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="px-8 pt-6">
        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="text-base leading-snug font-semibold">
              Transactions
            </div>
            <div className="inline-flex gap-1 rounded-full bg-muted p-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setType(filter.value);
                    setPage(1);
                  }}
                  className={cn(
                    "inline-flex h-8 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                    type === filter.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <hr className="ticket-perforation" />

          {transactionsQuery.isLoading ? (
            <div className="p-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="my-2 h-11 w-full rounded-md" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={<Wallet className="h-6 w-6" />}
              title="Nothing here yet"
              description="Ticket sales, fees and withdrawals all show up on this ledger."
            />
          ) : (
            <>
              <div className="px-5 py-1">
                {transactions.map((transaction) => {
                  const naira = koboToNaira(transaction.amountKobo);
                  const isCredit = naira > 0;

                  return (
                    <div
                      key={transaction._id}
                      className="flex items-center gap-3.5 py-3"
                    >
                      <div className="w-[150px] shrink-0">
                        <Badge
                          variant={
                            transaction.type === "ticket_sale"
                              ? "default"
                              : "outline"
                          }
                        >
                          {TYPE_LABELS[transaction.type]}
                        </Badge>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold">
                          {titleOf(transaction)}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {new Intl.DateTimeFormat("en-NG", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(transaction.createdAt))}
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {transaction.bucket}
                      </Badge>
                      <span
                        className={cn(
                          "w-[120px] shrink-0 text-right text-sm font-bold tabular-nums",
                          isCredit && "text-accent-foreground",
                        )}
                      >
                        {isCredit ? "+" : "−"}
                        {formatNairaAmount(Math.abs(naira))}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border bg-muted/60">
                <Pagination
                  page={transactionsQuery.data?.page ?? 1}
                  totalPages={transactionsQuery.data?.totalPages ?? 1}
                  totalItems={transactionsQuery.data?.totalItems ?? 0}
                  pageSize={20}
                  onPageChange={setPage}
                  noun="transaction"
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PayoutsPage;
