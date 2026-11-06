"use client";

import { EmptyState, ErrorState, PageHeader, Panel, PanelHeader, StatCell } from "@/components/organizer/organizer-primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { POSTER_TONES } from "@/components/vera/event-poster";
import { formatNairaAmount } from "@/lib/format-currency";
import { usePayoutAccount, useWallet, useWalletTransactions } from "@/lib/hooks/use-money";
import { useMyVendorLimits } from "@/lib/hooks/use-vendor";
import { koboToNaira, type WalletTransactionType } from "@/lib/types/money";
import { cn, ROUTES } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Check, Wallet } from "lucide-react";
import Link from "next/link";

/* Only the lines a vendor's own money produces. Their wallet is shared with
   any organizing they do, and mixing the two would make neither readable. */
const VENDOR_TYPES: WalletTransactionType[] = [
  "vendor_order_sale",
  "platform_fee",
];

const LABELS: Partial<Record<WalletTransactionType, string>> = {
  vendor_order_sale: "Order collected",
  platform_fee: "Vera fee",
  settlement: "Released for payout",
  withdrawal: "Paid to your bank",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

/** What a vendor has earned, what is still held, and where it goes. */
const VendorMoney = () => {
  const walletQuery = useWallet();
  const transactionsQuery = useWalletTransactions(1, "all");

  const wallet = walletQuery.data;
  const limitsQuery = useMyVendorLimits();
  const limits = limitsQuery.data;

  const rows = (transactionsQuery.data?.items ?? []).filter((row) =>
    VENDOR_TYPES.includes(row.type),
  );

  const accountQuery = usePayoutAccount();
  const account = accountQuery.data;
  const limitPercent = limits && limits.limitNaira ? Math.round((limits.soldNaira / limits.limitNaira) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 pb-10">
      <PageHeader lead="your" accent="money." description="Orders are paid for up front and released to you once you hand them over." />

      {walletQuery.isPending ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Skeleton className="h-64 rounded-[32px]" />
          <Skeleton className="h-64 rounded-[28px]" />
        </div>
      ) : walletQuery.isError || !wallet ? (
        <Panel>
          <ErrorState message="Couldn't load your wallet." onRetry={() => walletQuery.refetch()} />
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
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
                    <span className="truncate text-[13px] font-semibold opacity-75">{account.accountName}</span>
                  </span>
                </span>
              ) : accountQuery.isPending ? (
                <span />
              ) : (
                <span className="text-[15px] font-semibold opacity-80">No bank account yet. Add one to get paid.</span>
              )}
              <Link
                href={account ? "/organizer/payouts/withdraw" : ROUTES.VENDOR_ONBOARDING}
                className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0B1D14] px-6 text-[15px] font-bold text-[#F5F3EF] transition-opacity hover:opacity-90"
              >
                <Wallet className="h-4 w-4" />
                {account ? "Withdraw" : "Add bank account"}
              </Link>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <StatCell
              tone="yellow"
              label="Held until the event settles"
              value={formatNairaAmount(koboToNaira(wallet.pendingBalanceKobo))}
              note="paid 24 hours after the event ends"
            />

            {limits && limits.limitNaira !== null ? (
              <Link
                href={ROUTES.VENDOR_VERIFICATION}
                className="group flex flex-col gap-2 rounded-[24px] p-[clamp(16px,1.6vw,22px)] transition-opacity hover:opacity-95"
                style={{ backgroundColor: POSTER_TONES.blue.bg, color: POSTER_TONES.blue.fg }}
              >
                <span className="flex items-center justify-between gap-2 text-[13px] font-semibold opacity-75">
                  {limits.verificationLevel === "starter" ? "Starter limit" : "Verified limit"}
                  <span className="flex items-center gap-1 font-bold opacity-100">
                    Raise it
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </span>
                <span style={{ lineHeight: 1.05 }} className="truncate text-[clamp(24px,2.4vw,34px)] font-extrabold tracking-[-0.035em] tabular-nums">
                  {limitPercent}% used
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-black/10">
                  <span className="block h-full rounded-full bg-[#0F2633]" style={{ width: `${Math.min(100, limitPercent)}%` }} />
                </span>
                <span className="truncate text-[13px] font-semibold opacity-70">
                  {formatNairaAmount(limits.soldNaira)} of {formatNairaAmount(limits.limitNaira)}
                </span>
              </Link>
            ) : (
              <StatCell tone="blue" label="Sales limit" value={limitsQuery.isPending ? "…" : "No limit"} note="registered business" />
            )}
          </div>
        </div>
      )}

      <Panel className="mt-2">
        <PanelHeader title="Recent" description="Collected orders and Vera's fee on them." />
        {transactionsQuery.isPending ? (
          <div className="flex flex-col gap-2 px-5 pb-5 sm:px-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<Wallet className="h-6 w-6" />} title="nothing yet" description="Your first collected order shows up here." />
        ) : (
          <ul className="divide-y-[1.5px] divide-border border-t-[1.5px] border-border">
            {rows.map((row) => {
              const incoming = row.amountKobo >= 0;
              return (
                <li key={row._id} className="flex items-center gap-3.5 px-5 py-3.5 sm:px-6">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={incoming ? { backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg } : { backgroundColor: POSTER_TONES.cream.bg, color: POSTER_TONES.cream.fg }}
                  >
                    {incoming ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px] font-bold">{LABELS[row.type] ?? row.description}</span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {formatDate(row.createdAt)}
                      {row.status === "pending_settlement" ? " · held" : ""}
                    </span>
                  </span>
                  <span className={cn("text-[15px] font-extrabold tabular-nums", !incoming && "text-muted-foreground")}>
                    {incoming ? "" : "−"}
                    {formatNairaAmount(Math.abs(koboToNaira(row.amountKobo)))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default VendorMoney;
