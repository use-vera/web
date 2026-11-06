"use client";

import Button from "@/components/ui/button";
import { POSTER_TONES } from "@/components/vera/event-poster";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { formatNairaAmount } from "@/lib/format-currency";
import {
  useInitializePremium,
  useRestorePremium,
  useSubscription,
  useVerifyPremium,
} from "@/lib/hooks/use-money";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const FREE_INCLUDES = [
  "Unlimited events",
  "Ticket sales and door check-in",
  "Resale with price caps",
  "5% fee on tickets sold",
];

const PREMIUM_PERKS = [
  ["Advanced analytics", "Sell-through curves and demand by hour."],
  ["AI pricing suggestions", "What to charge, based on how the last one sold."],
  ["Featured event placement", "Discounted slots at the top of the home feed."],
  ["Attendee insights", "Who came back, and who never showed."],
  ["Export tools", "Finance and guest-list exports on demand."],
];

const PremiumPage = () => {
  const subscriptionQuery = useSubscription();
  const initialize = useInitializePremium();
  const verify = useVerifyPremium();
  const restore = useRestorePremium();
  const [checkingOut, setCheckingOut] = useState(false);

  const subscription = subscriptionQuery.data;
  const isActive =
    subscription?.subscriptionTier === "premium" &&
    subscription?.subscriptionStatus === "active";
  const price = subscription?.premiumPriceNaira ?? 0;

  /**
   * Same checkout shape the ticket purchase uses: Paystack opens in a popup,
   * and the original tab verifies once that popup closes.
   */
  const upgrade = async () => {
    try {
      const session = await initialize.mutateAsync(
        `${window.location.origin}/checkout/callback`,
      );

      if (!session.requiresPayment) {
        toast.success("Premium is active");
        subscriptionQuery.refetch();
        return;
      }

      const authorizationUrl = session.payment?.authorizationUrl;

      if (!authorizationUrl) {
        toast.error("Couldn't start checkout");
        return;
      }

      const popup = window.open(authorizationUrl, "_blank", "width=480,height=720");
      setCheckingOut(true);

      const poll = window.setInterval(() => {
        if (popup?.closed) {
          window.clearInterval(poll);

          verify
            .mutateAsync({
              reference: session.payment?.reference,
              paymentAttemptId: session.paymentAttemptId ?? undefined,
            })
            .then(() => toast.success("Premium is active"))
            .catch((error) =>
              toast.error(
                getApiErrorMessage(error, "We couldn't confirm that payment"),
              ),
            )
            .finally(() => setCheckingOut(false));
        }
      }, 700);
    } catch (error) {
      setCheckingOut(false);
      toast.error(getApiErrorMessage(error, "Couldn't start checkout"));
    }
  };

  const restoreSubscription = async () => {
    try {
      const state = await restore.mutateAsync();
      toast.success(
        state.subscriptionTier === "premium"
          ? "Premium restored"
          : "No active premium found on this account",
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't restore a purchase"));
    }
  };

  const expires =
    isActive && subscription?.premiumExpiresAt
      ? new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" }).format(new Date(subscription.premiumExpiresAt))
      : null;

  return (
    <section aria-label="Vera Premium" className="flex flex-col gap-6">
      <p className="text-[15px] text-muted-foreground">
        {isActive ? `Premium is on${expires ? ` until ${expires}` : ""}.` : "Grow smarter with deeper event intelligence."}
      </p>

      {subscriptionQuery.isLoading ? (
        <Skeleton className="h-[420px] w-full rounded-[30px]" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr_minmax(300px,0.9fr)]">
          {/* Free */}
          <div className="flex flex-col gap-5 rounded-[30px] p-[clamp(20px,2.4vw,28px)] ring-1 ring-border ring-inset" style={{ backgroundColor: POSTER_TONES.cream.bg, color: POSTER_TONES.cream.fg }}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-lg font-extrabold">free.</span>
              {!isActive ? <span className="rounded-full border-[1.5px] border-current px-3 py-1 text-xs font-bold">Your plan</span> : null}
            </div>
            <div>
              <div className="text-[44px] font-extrabold tracking-[-0.04em] tabular-nums" style={{ lineHeight: 1 }}>
                ₦0
              </div>
              <div className="mt-1 text-sm font-semibold opacity-70">forever</div>
            </div>
            <ul className="flex flex-col gap-2.5">
              {FREE_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] font-semibold opacity-80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.6} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div className="flex flex-col gap-5 rounded-[30px] p-[clamp(20px,2.4vw,28px)]" style={{ backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg }}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-lg font-extrabold">premium.</span>
              <span className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-bold text-foreground">
                <Sparkles className="h-3 w-3" />
                {isActive ? "Your plan" : "Recommended"}
              </span>
            </div>
            <div>
              <div className="text-[44px] font-extrabold tracking-[-0.04em] tabular-nums" style={{ lineHeight: 1 }}>
                {formatNairaAmount(price)}
              </div>
              <div className="mt-1 text-sm font-semibold opacity-70">per month · cancel any time</div>
            </div>
            <ul className="flex flex-col gap-3.5">
              {PREMIUM_PERKS.map(([title, body]) => (
                <li key={title} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                  <span>
                    <span className="block text-[15px] font-bold">{title}</span>
                    <span className="block text-sm font-medium text-pretty opacity-75">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Checkout */}
          <div className="flex flex-col gap-5 rounded-[30px] p-[clamp(20px,2.4vw,28px)]" style={{ backgroundColor: POSTER_TONES.ink.bg, color: POSTER_TONES.ink.fg }}>
            <span className="text-lg font-extrabold">{isActive ? "your subscription." : "upgrade."}</span>
            <dl className="flex flex-col gap-3">
              {[
                ["Renews", "Manually, you decide"],
                [isActive ? "Active until" : "Next charge", expires ?? "None scheduled"],
                ["Fee on tickets", "Still 5%"],
              ].map(([key, value]) => (
                <div key={key} className="flex justify-between gap-3 text-[15px]">
                  <dt className="opacity-65">{key}</dt>
                  <dd className="font-bold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-pretty opacity-65">Premium never renews on its own. When the month is up it simply stops, and your events keep running.</p>
            <div className="mt-auto flex flex-col gap-2">
              <Button
                size="lg"
                className="w-full bg-[#F5F3EF] text-[#16150F] hover:opacity-90"
                loading={initialize.isPending || checkingOut || verify.isPending}
                onClick={upgrade}
              >
                {isActive ? "Renew with Paystack" : "Upgrade with Paystack"}
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-inherit hover:bg-white/10" loading={restore.isPending} onClick={restoreSubscription}>
                Restore a purchase
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PremiumPage;
