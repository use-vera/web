"use client";

import AuthField from "@/components/auth/auth-field";
import Button from "@/components/ui/button";
import { formatNairaAmount } from "@/lib/format-currency";
import { useProfile, useUpdateProfile } from "@/lib/hooks/use-profile";
import {
  useMyVendorLimits,
  useSubmitVerification,
} from "@/lib/hooks/use-vendor";
import { type VendorVerificationLevel } from "@/lib/types/vendor";
import { cn } from "@/lib/utils";
import { Check, Clock, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LEVELS: {
  key: VendorVerificationLevel;
  name: string;
  needs: string;
  gets: string[];
}[] = [
  {
    key: "starter",
    name: "Starter",
    needs: "Bank account confirmed",
    gets: ["Sell up to your starter limit", "Paid after each event"],
  },
  {
    key: "verified",
    name: "Verified",
    needs: "Your BVN and date of birth. No documents.",
    gets: ["A much higher limit", "Verified badge for organizers"],
  },
  {
    key: "registered",
    name: "Registered business",
    needs: "Your CAC registration number",
    gets: ["No sales limit", "Can be booked for corporate events"],
  },
];

/**
 * The ladder: what a vendor may sell now, and the one thing that lifts it.
 *
 * Nothing here is asked for until it is actually in the way, which is the
 * whole reason sign-up could be three minutes long.
 */
const VendorVerification = () => {
  const limitsQuery = useMyVendorLimits();
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const submit = useSubmitVerification();

  const [bvn, setBvn] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [cacNumber, setCacNumber] = useState("");

  const limits = limitsQuery.data;
  const status = limits?.verification.status ?? "none";
  const currentIndex = LEVELS.findIndex(
    (level) => level.key === limits?.verificationLevel,
  );

  /* Half of the BVN check, and we cannot run it without them. Asked here
     rather than at sign-up, because here is where it does something. */
  const knownDateOfBirth = profileQuery.data?.dateOfBirth ?? null;

  const handleBvn = async () => {
    try {
      if (!knownDateOfBirth) {
        if (!dateOfBirth) {
          toast.error("Add your date of birth too.");
          return;
        }

        await updateProfile.mutateAsync({ dateOfBirth });
      }

      await submit.mutateAsync({ bvn });
      setBvn("");
      toast.success("Sent for review");
    } catch {
      toast.error("We couldn't send that. Check the details and try again.");
    }
  };

  const handleCac = async () => {
    try {
      await submit.mutateAsync({ cacNumber });
      setCacNumber("");
      toast.success("Sent for review");
    } catch {
      toast.error("We couldn't send that. Check the number and try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Raise your limit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Each step asks for one thing. You don&apos;t need any of it until you
          want more.
        </p>
      </div>

      {limits ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-card-foreground">
              Sold so far
            </p>
            <p className="text-sm tabular-nums text-muted-foreground">
              {formatNairaAmount(limits.soldNaira)}
              {limits.limitNaira === null
                ? " · no limit"
                : ` of ${formatNairaAmount(limits.limitNaira)}`}
            </p>
          </div>

          {limits.limitNaira !== null ? (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, Math.round((limits.soldNaira / limits.limitNaira) * 100))}%`,
                }}
              />
            </div>
          ) : null}

          {limits.next ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Next: {limits.next.needs}
            </p>
          ) : null}
        </div>
      ) : null}

      {status === "pending" ? (
        <p className="flex items-center gap-2 rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          We&apos;re checking what you sent. You can keep selling while we do.
        </p>
      ) : null}

      {status === "rejected" && limits?.verification.reviewNote ? (
        <p className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          {limits.verification.reviewNote}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {LEVELS.map((level, index) => {
          const reached = index <= currentIndex;
          const isNext = index === currentIndex + 1;

          return (
            <div
              key={level.key}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border border-border bg-card p-5",
                isNext && "ring-2 ring-primary",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-card-foreground">
                  {level.name}
                </h2>
                {reached ? (
                  <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
                    {index === currentIndex ? "You are here" : "Done"}
                  </span>
                ) : null}
              </div>

              <p className="flex gap-2 text-sm text-muted-foreground">
                {reached ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                {level.needs}
              </p>

              <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                {level.gets.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {limits?.verificationLevel === "starter" ? (
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold text-card-foreground">
            Verify with your BVN
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AuthField
              label="BVN"
              value={bvn}
              onChange={(event) =>
                setBvn(event.target.value.replace(/[^0-9]/g, "").slice(0, 11))
              }
              inputMode="numeric"
              placeholder="11 digits"
            />

            {knownDateOfBirth ? null : (
              <AuthField
                label="Date of birth"
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
              />
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            We use your BVN only to check that your name and date of birth match
            your bank account. We never see your bank login, PIN or balance, and
            we don&apos;t store the number itself.
          </p>

          <Button
            className="w-fit"
            disabled={bvn.length !== 11 || status === "pending"}
            loading={submit.isPending || updateProfile.isPending}
            onClick={() => void handleBvn()}
          >
            Send for review
          </Button>
        </section>
      ) : null}

      {limits?.verificationLevel !== "registered" ? (
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold text-card-foreground">
            Registered business
          </h2>

          <AuthField
            label="CAC registration number"
            value={cacNumber}
            onChange={(event) => setCacNumber(event.target.value)}
            placeholder="RC-123456"
            className="sm:max-w-xs"
          />

          <Button
            className="w-fit"
            variant="outline"
            disabled={cacNumber.trim().length < 3 || status === "pending"}
            loading={submit.isPending}
            onClick={() => void handleCac()}
          >
            Send for review
          </Button>
        </section>
      ) : null}
    </div>
  );
};

export default VendorVerification;
