"use client";

import { DESK, EmptyState, ErrorState, FilterPills, PageHeader, Panel, PanelHeader } from "@/components/organizer/organizer-primitives";
import { POSTER_TONES } from "@/components/vera/event-poster";
import { Pagination } from "@/components/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNairaAmount, formatNairaCompact } from "@/lib/format-currency";
import { usePayoutAccount, useWallet, useWalletTransactions } from "@/lib/hooks/use-money";
import {
  koboToNaira,
  type WalletTransactionApi,
  type WalletTransactionType,
} from "@/lib/types/money";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Check, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TYPE_LABELS: Record<WalletTransactionType, string> = {
  ticket_sale: "Ticket sale",
  add_on_sale: "Add-on sale",
  ticket_upgrade: "Ticket upgrade",
  /* Vendors earn through the same wallet, and organizers earn from them. */
  vendor_order_sale: "Vendor order",
  vendor_revenue_share: "Share of vendor sales",
  vendor_stall_fee: "Stall fee",
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

/** "Platform fee for Afrobeats Night". The bare label when no event is tied. */
const titleOf = (transaction: WalletTransactionApi) => {
  const label = TYPE_LABELS[transaction.type] ?? "Transaction";
  const eventName = eventNameOf(transaction.eventId);

  return eventName ? `${label} for ${eventName}` : label;
};


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
    <div className={DESK}>
      <PageHeader lead="your" accent="payouts." description="What you have earned, what has cleared, and what is on its way to your bank." />

      <div className="flex flex-col gap-4">
        {walletQuery.isLoading ? (
          <Skeleton className="h-[260px] w-full rounded-[32px]" />
        ) : walletQuery.isError || !wallet ? (
          <ErrorState message="Couldn't load your wallet." onRetry={() => walletQuery.refetch()} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* What they can take out right now, and where it goes. */}
            <section
              aria-label="Ready to withdraw"
              className="flex flex-col gap-6 rounded-[32px] p-[clamp(20px,3vw,36px)]"
              style={{ backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg }}
            >
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold opacity-75">Ready to withdraw</span>
                <span style={{ lineHeight: 0.9 }} className="text-[clamp(44px,6vw,80px)] font-extrabold tracking-[-0.05em] tabular-nums">
                  {formatNairaAmount(koboToNaira(wallet.availableBalanceKobo))}
                </span>
              </div>

              <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {account ? (
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B1D14] text-[#15C67C]">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[15px] font-bold">
                        {account.bankName} ••••{account.accountNumber.slice(-4)}
                      </span>
                      <span className="truncate text-[13px] font-semibold opacity-75">
                        {account.accountName} · {account.kycStatus === "verified" ? "verified" : account.kycStatus} · lands in 24–48 hours
                      </span>
                    </span>
                  </span>
                ) : accountQuery.isLoading ? (
                  <span />
                ) : (
                  <span className="text-[15px] font-semibold opacity-80">No payout account yet. Add one before you can withdraw.</span>
                )}
                <Link
                  href="/organizer/payouts/withdraw"
                  className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0B1D14] px-6 text-[15px] font-bold text-[#F5F3EF] transition-opacity hover:opacity-90"
                >
                  <Wallet className="h-4 w-4" />
                  {account ? "Withdraw" : "Add account"}
                </Link>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Pending", kobo: wallet.pendingBalanceKobo, note: "clears after each event", tone: "yellow" as const },
                { label: "Reserved", kobo: wallet.reservedBalanceKobo, note: "withdrawal in flight", tone: "blue" as const },
                { label: "Owing", kobo: wallet.owingBalanceKobo, note: "refunds to recover", tone: "pink" as const },
              ].map((cell) => (
                <div
                  key={cell.label}
                  className="flex items-center justify-between gap-3 rounded-[24px] px-5 py-4"
                  style={{ backgroundColor: POSTER_TONES[cell.tone].bg, color: POSTER_TONES[cell.tone].fg }}
                >
                  <span className="flex flex-col">
                    <span className="text-[15px] font-bold">{cell.label}</span>
                    <span className="text-[13px] font-semibold opacity-70">{cell.note}</span>
                  </span>
                  <span className="text-[22px] font-extrabold tracking-[-0.03em] tabular-nums">{formatNairaAmount(koboToNaira(cell.kobo))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {wallet ? (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-[28px] border-[1.5px] border-border p-5 sm:p-6 lg:grid-cols-4">
            {[
              ["Lifetime sales", wallet.lifetimeGrossSalesKobo, false],
              ["Platform fees", wallet.lifetimePlatformFeesKobo, true],
              ["Withdrawn", wallet.lifetimeWithdrawnKobo, false],
              ["Refunded", wallet.lifetimeRefundedKobo, true],
            ].map(([label, kobo, negative]) => (
              <div key={String(label)} className="flex flex-col gap-1">
                <dt className="text-[13px] font-semibold text-muted-foreground">{label}</dt>
                <dd className="text-[22px] font-extrabold tracking-[-0.03em] tabular-nums">
                  {negative ? "−" : ""}
                  {formatNairaCompact(koboToNaira(Number(kobo)))}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <Panel>
          <PanelHeader
            title="Transactions"
            description="Sales, fees and withdrawals, newest first."
            className="flex-col sm:flex-row sm:items-center"
            action={
              <FilterPills
                label="Filter transactions"
                options={FILTERS}
                value={type}
                onChange={(value) => {
                  setType(value);
                  setPage(1);
                }}
              />
            }
          />

          {transactionsQuery.isLoading ? (
            <div className="flex flex-col gap-2 px-5 pb-5 sm:px-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-2xl" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState icon={<Wallet className="h-6 w-6" />} title="Nothing here yet" description="Ticket sales, fees and withdrawals all show up on this ledger." />
          ) : (
            <>
              <div className="flex flex-col px-2.5 pb-2">
                {transactions.map((transaction) => {
                  const naira = koboToNaira(transaction.amountKobo);
                  const isCredit = naira > 0;

                  return (
                    <div key={transaction._id} className="flex items-center gap-3.5 rounded-[18px] px-2.5 py-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                          isCredit ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                        )}
                      >
                        {isCredit ? <ArrowDownLeft className="h-4 w-4" strokeWidth={2.6} /> : <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-bold">{titleOf(transaction)}</div>
                        <div className="truncate text-[13px] text-muted-foreground tabular-nums">
                          {new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(transaction.createdAt))}
                          {" · "}
                          <span className="capitalize">{transaction.bucket}</span>
                        </div>
                      </div>
                      <span className={cn("shrink-0 text-right text-[15px] font-extrabold tabular-nums", isCredit && "text-accent-foreground")}>
                        {isCredit ? "+" : "−"}
                        {formatNairaAmount(Math.abs(naira))}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t-[1.5px] border-border px-5 sm:px-6">
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
        </Panel>
      </div>
    </div>
  );
};

export default PayoutsPage;
