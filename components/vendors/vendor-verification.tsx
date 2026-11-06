"use client";

import AuthField from "@/components/auth/auth-field";
import { ErrorState, PageHeader, Panel, PanelHeader } from "@/components/organizer/organizer-primitives";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { POSTER_TONES } from "@/components/vera/event-poster";
import { formatNairaAmount } from "@/lib/format-currency";
import { useProfile, useUpdateProfile } from "@/lib/hooks/use-profile";
import {
  useMyVendorLimits,
  useSubmitVerification,
} from "@/lib/hooks/use-vendor";
import { type VendorVerificationLevel } from "@/lib/types/vendor";
import { cn } from "@/lib/utils";
import { Check, Clock, Lock, ShieldCheck, TriangleAlert } from "lucide-react";
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

  const usedPercent = limits && limits.limitNaira ? Math.min(100, Math.round((limits.soldNaira / limits.limitNaira) * 100)) : 0;

  return (
    <div className="flex flex-col gap-4 pb-10">
      <PageHeader lead="raise your" accent="limit." description="Each step asks for one thing. You don't need any of it until you want to sell more." />

      {limitsQuery.isPending ? <Skeleton className="h-48 rounded-[32px]" /> : null}

      {limitsQuery.isError ? (
        <Panel>
          <ErrorState message="Couldn't load your limit." onRetry={() => limitsQuery.refetch()} />
        </Panel>
      ) : null}

      {limits ? (
        <section
          aria-label="Sold so far"
          className="flex flex-col gap-5 rounded-[32px] p-[clamp(20px,3vw,36px)]"
          style={{ backgroundColor: POSTER_TONES.blue.bg, color: POSTER_TONES.blue.fg }}
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold opacity-75">Sold so far</span>
              <span style={{ lineHeight: 0.9 }} className="text-[clamp(40px,5.4vw,72px)] font-extrabold tracking-[-0.05em] tabular-nums">
                {formatNairaAmount(limits.soldNaira)}
              </span>
            </div>
            <span className="pb-1 text-[15px] font-bold tabular-nums opacity-80">
              {limits.limitNaira === null ? "No limit" : `of ${formatNairaAmount(limits.limitNaira)}`}
            </span>
          </div>

          {limits.limitNaira !== null ? (
            <div className="h-3 overflow-hidden rounded-full bg-black/10">
              <div className="h-full rounded-full bg-[#0F2633] transition-[width] duration-500" style={{ width: `${usedPercent}%` }} />
            </div>
          ) : null}

          {limits.next ? <p className="text-[15px] font-semibold opacity-80">Next step: {limits.next.needs}</p> : null}
        </section>
      ) : null}

      {status === "pending" ? (
        <p
          className="flex items-center gap-2.5 rounded-[22px] p-4 text-[15px] font-semibold"
          style={{ backgroundColor: POSTER_TONES.yellow.bg, color: POSTER_TONES.yellow.fg }}
        >
          <Clock className="h-4 w-4 shrink-0" />
          We&apos;re checking what you sent. You can keep selling while we do.
        </p>
      ) : null}

      {status === "rejected" && limits?.verification.reviewNote ? (
        <p
          className="flex items-start gap-2.5 rounded-[22px] p-4 text-[15px] font-semibold"
          style={{ backgroundColor: POSTER_TONES.pink.bg, color: POSTER_TONES.pink.fg }}
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {limits.verification.reviewNote}
        </p>
      ) : null}

      <ol className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {LEVELS.map((level, index) => {
          const reached = index <= currentIndex;
          const here = index === currentIndex;
          const isNext = index === currentIndex + 1;

          return (
            <li
              key={level.key}
              className={cn(
                "flex flex-col gap-3 rounded-[28px] p-5 sm:p-6",
                !reached && "border-[1.5px]",
                !reached && (isNext ? "border-foreground" : "border-border"),
              )}
              style={reached ? { backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg } : undefined}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold opacity-70 tabular-nums">Step {index + 1}</span>
                {here ? (
                  <span className="rounded-full bg-[#0B1D14] px-2.5 py-1 text-xs font-bold text-[#F5F3EF]">You are here</span>
                ) : reached ? (
                  <span className="flex items-center gap-1 text-xs font-bold">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    Done
                  </span>
                ) : isNext ? (
                  <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-bold text-background">Next</span>
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <h2 style={{ lineHeight: 1 }} className="text-[24px] font-extrabold tracking-[-0.035em]">
                {level.name}
              </h2>

              <p className={cn("text-[15px] font-semibold", !reached && "text-muted-foreground")}>{level.needs}</p>

              <ul className="mt-auto flex flex-col gap-1.5 border-t-[1.5px] border-dashed border-current/25 pt-3 text-[13px] font-medium">
                {level.gets.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.6} />
                    {line}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
        {limits?.verificationLevel === "starter" ? (
          <Panel>
            <PanelHeader title="Verify with your BVN" description="Lifts you to Verified. No documents." />
            <div className="flex flex-col gap-4 px-5 pb-6 sm:px-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AuthField
                  label="BVN"
                  value={bvn}
                  onChange={(event) => setBvn(event.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="11 digits"
                />

                {knownDateOfBirth ? null : (
                  <AuthField label="Date of birth" type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} />
                )}
              </div>

              <p className="flex items-start gap-2 text-[13px] text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                We use your BVN only to check that your name and date of birth match your bank account. We never see your bank login, PIN or balance, and
                we don&apos;t store the number itself.
              </p>

              <Button
                variant="ink"
                className="w-fit"
                disabled={bvn.length !== 11 || status === "pending"}
                loading={submit.isPending || updateProfile.isPending}
                onClick={() => void handleBvn()}
              >
                Send for review
              </Button>
            </div>
          </Panel>
        ) : null}

        {limits && limits.verificationLevel !== "registered" ? (
          <Panel>
            <PanelHeader title="Registered business" description="Removes the limit and opens corporate events." />
            <div className="flex flex-col gap-4 px-5 pb-6 sm:px-6">
              <AuthField label="CAC registration number" value={cacNumber} onChange={(event) => setCacNumber(event.target.value)} placeholder="RC-123456" />

              <Button
                className="w-fit"
                variant="line"
                disabled={cacNumber.trim().length < 3 || status === "pending"}
                loading={submit.isPending}
                onClick={() => void handleCac()}
              >
                Send for review
              </Button>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
};

export default VendorVerification;
