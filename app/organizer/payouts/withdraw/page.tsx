"use client";

import { OrganizerField } from "@/components/organizer/organizer-field";
import { Eyebrow, SectionLabel } from "@/components/organizer/organizer-primitives";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { formatNairaAmount } from "@/lib/format-currency";
import {
  useBanks,
  usePayoutAccount,
  usePreviewPayoutAccount,
  useRequestWithdrawal,
  useSavePayoutAccount,
  useWallet,
  useWithdrawals,
} from "@/lib/hooks/use-money";
import { koboToNaira, nairaToKobo } from "@/lib/types/money";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, ChevronDown, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const WithdrawPage = () => {
  const router = useRouter();
  const walletQuery = useWallet();
  const accountQuery = usePayoutAccount();
  const banksQuery = useBanks();
  const withdrawalsQuery = useWithdrawals(1);

  const preview = usePreviewPayoutAccount();
  const saveAccount = useSavePayoutAccount();
  const withdraw = useRequestWithdrawal();

  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [showAccountForm, setShowAccountForm] = useState(false);

  const wallet = walletQuery.data;
  const account = accountQuery.data;
  const availableNaira = koboToNaira(wallet?.availableBalanceKobo ?? 0);
  const amountNaira = Number(amount) || 0;
  const canWithdraw =
    Boolean(account) && amountNaira > 0 && amountNaira <= availableNaira;

  const quickAmounts = [100_000, 500_000, 1_000_000].filter(
    (value) => value <= availableNaira,
  );

  /* The bank check runs on demand rather than per keystroke. It is a real
     lookup against the bank, not a format check. */
  const checkAccount = async () => {
    try {
      await preview.mutateAsync({ bankCode, accountNumber });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Couldn't find that account. Check the number."),
      );
    }
  };

  const confirmAccount = async () => {
    try {
      await saveAccount.mutateAsync({ bankCode, accountNumber });
      toast.success("Payout account saved");
      setShowAccountForm(false);
      preview.reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't save that account"));
    }
  };

  const submit = async () => {
    try {
      await withdraw.mutateAsync(nairaToKobo(amountNaira));
      toast.success(`${formatNairaAmount(amountNaira)} on its way`);
      router.push("/organizer/payouts");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't start that withdrawal"));
    }
  };

  return (
    <div className="pb-8">
      <header className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-7">
        <Link
          href="/organizer/payouts"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Payouts
        </Link>
        <h1 className="mt-3.5 text-[26px] leading-tight font-bold tracking-[-0.02em]">
          Withdraw
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Move cleared earnings to your bank.
        </p>
      </header>

      <div className="flex flex-col items-stretch gap-3.5 px-4 lg:flex-row lg:items-start pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div className="min-w-0 w-full lg:max-w-[640px] lg:flex-1">
          <Card className="gap-0 py-0">
            <div className="p-5">
              <SectionLabel>How much</SectionLabel>
              {walletQuery.isLoading ? (
                <Skeleton className="h-16 w-full rounded-md" />
              ) : (
                <>
                  <div className="flex h-16 items-center gap-2 rounded-md border border-border bg-background px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                    <span className="text-xl text-muted-foreground">₦</span>
                    <input
                      value={amount ? Number(amount).toLocaleString("en-NG") : ""}
                      onChange={(input) =>
                        setAmount(input.target.value.replace(/[^0-9]/g, ""))
                      }
                      inputMode="numeric"
                      placeholder="0"
                      aria-label="Amount to withdraw in naira"
                      className="w-full bg-transparent text-2xl font-bold tracking-[-0.01em] tabular-nums outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickAmounts.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAmount(String(value))}
                        className="cursor-pointer"
                      >
                        <Badge
                          variant={
                            Number(amount) === value ? "default" : "outline"
                          }
                          className="px-3 py-1.5"
                        >
                          {formatNairaAmount(value)}
                        </Badge>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount(String(availableNaira))}
                      className="cursor-pointer"
                    >
                      <Badge
                        variant={
                          Number(amount) === availableNaira && availableNaira > 0
                            ? "default"
                            : "outline"
                        }
                        className="px-3 py-1.5"
                      >
                        All {formatNairaAmount(availableNaira)}
                      </Badge>
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatNairaAmount(availableNaira)} available. Pending
                    earnings clear after each event ends.
                  </p>
                  {amountNaira > availableNaira ? (
                    <p className="mt-2 text-[13px] font-semibold text-destructive">
                      That is more than you have available.
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <hr className="ticket-perforation" />

            <div className="flex items-center gap-3.5 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Wallet className="h-[17px] w-[17px]" />
              </span>
              <div className="min-w-0 flex-1">
                {accountQuery.isLoading ? (
                  <Skeleton className="h-8 w-48 rounded-md" />
                ) : account ? (
                  <>
                    <div className="truncate text-[13px] font-semibold">
                      {account.bankName} ••••{account.accountNumber.slice(-4)}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {account.accountName}
                    </div>
                  </>
                ) : (
                  <div className="text-[13px] text-muted-foreground">
                    No payout account yet.
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-9 shrink-0 text-xs"
                onClick={() => setShowAccountForm((current) => !current)}
              >
                {account ? "Change" : "Add account"}
              </Button>
            </div>
          </Card>

          {showAccountForm ? (
            <Card className="mt-3.5 gap-0 py-0">
              <div className="px-5 py-4">
                <div className="text-base leading-snug font-semibold">
                  {account ? "Change payout account" : "Add a payout account"}
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  We check the name on the account before anything is sent.
                </p>
              </div>
              <hr className="ticket-perforation" />
              <div className="p-5">
                <div className="flex flex-col gap-3.5 sm:flex-row">
                  <label className="flex-1">
                    <SectionLabel>Bank</SectionLabel>
                    <div className="relative">
                      <select
                        value={bankCode}
                        aria-label="Bank"
                        onChange={(input) => {
                          setBankCode(input.target.value);
                          preview.reset();
                        }}
                        className="h-12 w-full cursor-pointer appearance-none rounded-md border border-border bg-background px-4 pr-10 text-sm transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                      >
                        <option value="">Select a bank…</option>
                        {(banksQuery.data ?? []).map((bank) => (
                          <option key={bank.code} value={bank.code}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </label>
                  <label className="flex-1">
                    <SectionLabel>Account number</SectionLabel>
                    <OrganizerField
                      value={accountNumber}
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="0123456789"
                      className="tabular-nums"
                      onChange={(input) => {
                        setAccountNumber(
                          input.target.value.replace(/[^0-9]/g, ""),
                        );
                        preview.reset();
                      }}
                    />
                  </label>
                </div>

                {preview.data ? (
                  <div className="mt-3.5 flex items-center gap-3 rounded-sm bg-accent p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-accent-foreground">
                        {preview.data.accountName}
                      </div>
                      <div className="truncate text-xs text-accent-foreground/85">
                        {preview.data.bankName}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-9 shrink-0 text-xs"
                      loading={saveAccount.isPending}
                      onClick={confirmAccount}
                    >
                      Use this account
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3.5"
                    loading={preview.isPending}
                    disabled={!bankCode || accountNumber.length < 10}
                    onClick={checkAccount}
                  >
                    Check account
                  </Button>
                )}
              </div>
            </Card>
          ) : null}
        </div>

        <div className="w-full lg:w-[360px] lg:shrink-0">
          <Card className="gap-0 py-0">
            <div className="p-5">
              <Eyebrow>Withdrawing</Eyebrow>
              <div className="mt-1.5 text-3xl font-bold tracking-[-0.02em] tabular-nums">
                {formatNairaAmount(amountNaira)}
              </div>
            </div>
            <hr className="ticket-perforation" />
            <div className="flex flex-col gap-2.5 px-5 py-4">
              {[
                [
                  "To",
                  account
                    ? `${account.bankName} ••••${account.accountNumber.slice(-4)}`
                    : "No account yet",
                ],
                ["Arrives", "24–48 hours"],
                [
                  "Left available",
                  formatNairaAmount(Math.max(0, availableNaira - amountNaira)),
                ],
              ].map(([key, value]) => (
                <div key={key} className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-semibold tabular-nums">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-muted/60 px-5 py-4">
              <Button
                className="w-full"
                disabled={!canWithdraw}
                loading={withdraw.isPending}
                onClick={submit}
              >
                {amountNaira > 0
                  ? `Withdraw ${formatNairaAmount(amountNaira)}`
                  : "Withdraw"}
              </Button>
              <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
                Held as reserved until your bank confirms. Failed transfers
                return to available.
              </p>
            </div>
          </Card>

          <Card className="mt-3 gap-0 py-0">
            <div className="px-5 py-4">
              <div className="text-base leading-snug font-semibold">
                Recent withdrawals
              </div>
            </div>
            <hr className="ticket-perforation" />
            <div className="px-5 py-1 pb-2.5">
              {withdrawalsQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="my-2.5 h-10 w-full rounded-md" />
                ))
              ) : (withdrawalsQuery.data?.items ?? []).length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted-foreground">
                  Nothing withdrawn yet.
                </p>
              ) : (
                (withdrawalsQuery.data?.items ?? []).map((item) => (
                  <div key={item._id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold tabular-nums">
                        {formatNairaAmount(koboToNaira(item.amountKobo))}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {new Intl.DateTimeFormat("en-NG", {
                          day: "numeric",
                          month: "short",
                        }).format(new Date(item.createdAt))}
                      </div>
                    </div>
                    <Badge
                      variant={item.status === "completed" ? "default" : "outline"}
                      className={cn(
                        "capitalize",
                        item.status === "failed" &&
                          "border-destructive/60 text-destructive",
                      )}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;
