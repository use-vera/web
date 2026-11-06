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
import { POSTER_TONES } from "@/components/vera/event-poster";

/** The account that will be paid, on green once the bank has confirmed the name. */
const AccountCard = ({ name, line }: { name: string; line: string }) => (
  <div className="flex items-center gap-3 rounded-[22px] p-4" style={{ backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg }}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B1D14] text-[#15C67C]">
      <ShieldCheck className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="truncate text-[15px] font-bold">{name}</p>
      <p className="truncate text-[13px] font-semibold opacity-75">{line}</p>
    </div>
  </div>
);

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
      <AccountCard name={existing.accountName} line={`${existing.bankName} ••••${existing.accountNumber.slice(-4)}`} />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="vendor-bank"
            className="text-sm font-bold text-foreground"
          >
            Bank
          </label>

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
        <AccountCard name={resolved.accountName} line={`Confirmed with ${resolved.bankName}`} />
      ) : null}

      <div className="flex flex-col gap-3 rounded-[24px] border-[1.5px] border-border p-5">
        <span className="text-sm font-bold">How payouts work</span>
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
        variant="ink"
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
