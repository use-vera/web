"use client";

import { useWallet, useWalletTransactions } from "@/lib/hooks/use-money";
import { useMyVendor } from "@/lib/hooks/use-vendor";
import { formatNairaAmount } from "@/lib/format-currency";
import { koboToNaira, type WalletTransactionType } from "@/lib/types/money";
import { useMyVendorLimits } from "@/lib/hooks/use-vendor";
import { formatNairaAmount as formatNaira } from "@/lib/format-currency";
import { ROUTES } from "@/lib/utils";
import { ArrowUpRight, Banknote, Clock, ShieldCheck } from "lucide-react";
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
  const vendorQuery = useMyVendor();

  const wallet = walletQuery.data;
  const vendor = vendorQuery.data;
  const limitsQuery = useMyVendorLimits();
  const limits = limitsQuery.data;

  const rows = (transactionsQuery.data?.items ?? []).filter((row) =>
    VENDOR_TYPES.includes(row.type),
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Money</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Orders are paid for up front and released to you once you hand them
          over.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Held until the event settles
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-card-foreground">
            {formatNairaAmount(koboToNaira(wallet?.pendingBalanceKobo ?? 0))}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Banknote className="h-3.5 w-3.5" />
            Ready to withdraw
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-card-foreground">
            {formatNairaAmount(koboToNaira(wallet?.availableBalanceKobo ?? 0))}
          </p>
          <Link
            href="/organizer/payouts/withdraw"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-foreground"
          >
            Withdraw
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Paid into
          </div>
          <p className="mt-2 text-sm font-semibold text-card-foreground">
            {vendor?.payoutReady ? "Your saved bank account" : "No bank account yet"}
          </p>
          {!vendor?.payoutReady ? (
            <Link
              href={ROUTES.VENDOR_ONBOARDING}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-foreground"
            >
              Add one
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      {limits && limits.limitNaira !== null ? (
        <Link
          href={ROUTES.VENDOR_VERIFICATION}
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-card-foreground">
              {limits.verificationLevel === "starter"
                ? "Starter account"
                : "Verified account"}
            </p>
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
              Raise limit
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatNaira(limits.soldNaira)} of {formatNaira(limits.limitNaira)}{" "}
            used
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(100, Math.round((limits.soldNaira / limits.limitNaira) * 100))}%`,
              }}
            />
          </div>
        </Link>
      ) : null}

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Recent
        </h2>

        {transactionsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : null}

        {rows.length === 0 && !transactionsQuery.isPending ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nothing yet. Your first collected order shows up here.
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {rows.map((row) => (
              <li key={row._id} className="flex items-center gap-4 p-4">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-card-foreground">
                    {LABELS[row.type] ?? row.description}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatDate(row.createdAt)}
                    {row.status === "pending_settlement" ? " · held" : ""}
                  </span>
                </span>
                <span
                  className={
                    row.amountKobo < 0
                      ? "text-sm font-bold tabular-nums text-muted-foreground"
                      : "text-sm font-bold tabular-nums text-card-foreground"
                  }
                >
                  {row.amountKobo < 0 ? "−" : ""}
                  {formatNairaAmount(Math.abs(koboToNaira(row.amountKobo)))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default VendorMoney;
