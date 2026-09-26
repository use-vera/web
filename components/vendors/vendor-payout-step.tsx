"use client";

import AuthField from "@/components/auth/auth-field";
import Button from "@/components/ui/button";
import {
  useBanks,
  usePayoutAccount,
  usePreviewPayoutAccount,
  useSavePayoutAccount,
} from "@/lib/hooks/use-money";
import { Clock, Loader2, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Select } from "../ui/select";

/**
 * A vendor's bank account is the same record an organizer uses: one payout
 * account per Vera account. So this reuses the wallet endpoints rather than
 * growing a second bank-details flow that could drift from the first.
 */
const VendorPayoutStep = () => {
  const banksQuery = useBanks();
  const accountQuery = usePayoutAccount();
  const preview = usePreviewPayoutAccount();
  const save = useSavePayoutAccount();

  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const existing = accountQuery.data;
  const resolved = preview.data;

  /* Paystack resolves a name from ten digits, so the check fires as soon as
     there are ten: nobody should press a button to find out. */
  const handleAccountNumber = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 10);
    setAccountNumber(digits);

    if (digits.length === 10 && bankCode) {
      preview.mutate({ bankCode, accountNumber: digits });
    }
  };

  const handleBank = (value: string) => {
    setBankCode(value);

    if (value && accountNumber.length === 10) {
      preview.mutate({ bankCode: value, accountNumber });
    }
  };

  const handleSave = async () => {
    try {
      await save.mutateAsync({ bankCode, accountNumber });
      toast.success("Bank account saved");
    } catch {
      toast.error("Couldn't save that account. Check the details.");
    }
  };

  const banks = banksQuery.data?.map((d) => ({
    value: d?.code,
    label: d?.name,
  }));

  if (existing) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-accent p-4 text-accent-foreground">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-bold uppercase">{existing.accountName}</p>
          <p className="text-sm">
            {existing.bankName} ····{existing.accountNumber.slice(-4)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="vendor-bank"
            className="text-sm font-semibold text-foreground"
          >
            Bank
          </label>

          {/* <select
            id="vendor-bank"
            value={bankCode}
            onChange={(event) => handleBank(event.target.value)}
            className="h-12 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none focus-visible:border-primary"
          >
            <option value="">Choose your bank</option>
            {(banksQuery.data ?? []).map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select> */}

          <Select
            id="vendor-bank"
            value={bankCode}
            onValueChange={(event) => {
              if (event) handleBank(event);
            }}
            options={(banks as []) ?? []}
            placeholder="Select a bank"
          />
        </div>

        <AuthField
          label="Account number"
          value={accountNumber}
          onChange={(event) => handleAccountNumber(event.target.value)}
          inputMode="numeric"
          placeholder="0123456789"
          max={11}
        />
      </div>

      {preview.isPending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking with your bank…
        </p>
      ) : null}

      {preview.isError ? (
        <p className="text-sm text-destructive">
          We couldn&apos;t find that account. Check the number and the bank.
        </p>
      ) : null}

      {resolved ? (
        <div className="flex items-center gap-3 rounded-2xl bg-accent p-4 text-accent-foreground">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold uppercase">
              {resolved.accountName}
            </p>
            <p className="text-sm">Confirmed with {resolved.bankName}</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <span className="text-xs font-semibold uppercase text-muted-foreground">
          How payouts work
        </span>
        <p className="flex gap-2.5 text-sm text-muted-foreground">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          Money from collected orders is paid
          <span className="font-semibold text-foreground">
            24 hours after the event ends
          </span>
          .
        </p>
        <p className="flex gap-2.5 text-sm text-muted-foreground">
          <Zap className="mt-0.5 h-4 w-4 shrink-0" />
          If you can&apos;t fulfil an order, the buyer is refunded and you
          aren&apos;t charged a fee.
        </p>
      </div>

      <Button
        className="w-fit"
        loading={save.isPending}
        disabled={!resolved}
        onClick={() => void handleSave()}
      >
        Save bank account
      </Button>
    </div>
  );
};

export default VendorPayoutStep;
