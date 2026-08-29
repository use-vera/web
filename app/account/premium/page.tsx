"use client";

import { Eyebrow } from "@/components/organizer/organizer-primitives";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { formatNairaAmount } from "@/lib/format-currency";
import {
  useInitializePremium,
  useRestorePremium,
  useSubscription,
  useVerifyPremium,
} from "@/lib/hooks/use-money";
import { Check, Sparkles, TriangleAlert } from "lucide-react";
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

  return (
    <div className="pb-8">
      <header className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-7">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[26px] leading-tight font-bold tracking-[-0.02em]">
            Vera Premium
          </h1>
          {isActive ? (
            <Badge>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Active
            </Badge>
          ) : null}
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Grow smarter with deeper event intelligence.
        </p>
      </header>

      {subscriptionQuery.isLoading ? (
        <div className="px-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
          <Skeleton className="h-[420px] w-full rounded-sm" />
        </div>
      ) : (
        <div className="flex flex-col items-stretch gap-3.5 px-4 lg:flex-row lg:items-start pt-5 sm:px-6 lg:px-8 lg:pt-6">
          <div className="flex min-w-0 flex-1 flex-col gap-3.5 sm:flex-row">
            <Card className="flex-1 gap-0 py-0">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-base leading-snug font-semibold">
                    Free
                  </span>
                  {!isActive ? <Badge variant="outline">Your plan</Badge> : null}
                </div>
                <div className="mt-3 text-3xl font-bold tracking-[-0.02em] tabular-nums">
                  ₦0
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">forever</div>
              </div>
              <hr className="ticket-perforation" />
              <div className="flex flex-col gap-2.5 px-5 py-4">
                {FREE_INCLUDES.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-px h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flex-1 gap-0 py-0 shadow-[inset_0_0_0_2px_var(--primary),0_4px_12px_rgba(22,21,15,0.06)]">
              <div className="bg-accent p-5">
                <div className="flex items-center justify-between">
                  <span className="text-base leading-snug font-semibold text-accent-foreground">
                    Premium
                  </span>
                  <Badge variant="solid">
                    <Sparkles className="h-3 w-3" />
                    {isActive ? "Your plan" : "Recommended"}
                  </Badge>
                </div>
                <div className="mt-3 text-3xl font-bold tracking-[-0.02em] text-accent-foreground tabular-nums">
                  {formatNairaAmount(price)}
                </div>
                <div className="mt-0.5 text-xs text-accent-foreground/85">
                  per month · cancel any time
                </div>
              </div>
              <hr className="ticket-perforation" />
              <div className="flex flex-col gap-3 px-5 py-4">
                {PREMIUM_PERKS.map(([title, body]) => (
                  <div key={title} className="flex items-start gap-2.5">
                    <Check
                      className="mt-px h-3.5 w-3.5 shrink-0 text-primary"
                      strokeWidth={3}
                    />
                    <div>
                      <div className="text-[13px] font-semibold">{title}</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-pretty text-muted-foreground">
                        {body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="w-full lg:w-[340px] lg:shrink-0">
            <Card className="gap-0 py-0">
              <div className="p-5">
                <Eyebrow>{isActive ? "Your subscription" : "Upgrade"}</Eyebrow>
                <div className="mt-1.5 text-3xl font-bold tracking-[-0.02em] tabular-nums">
                  {formatNairaAmount(price)}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  billed monthly, not automatic
                </div>
              </div>
              <hr className="ticket-perforation" />
              <div className="flex flex-col gap-2.5 px-5 py-4">
                {[
                  ["Renews", "Manually, you decide"],
                  [
                    isActive ? "Active until" : "Next charge",
                    isActive && subscription?.premiumExpiresAt
                      ? new Intl.DateTimeFormat("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(subscription.premiumExpiresAt))
                      : "None scheduled",
                  ],
                  ["Fee on tickets", "Still 5%"],
                ].map(([key, value]) => (
                  <div key={key} className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-muted/60 px-5 py-4">
                <Button
                  className="w-full"
                  loading={initialize.isPending || checkingOut || verify.isPending}
                  onClick={upgrade}
                >
                  {isActive ? "Renew with Paystack" : "Upgrade with Paystack"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full"
                  loading={restore.isPending}
                  onClick={restoreSubscription}
                >
                  Restore a purchase
                </Button>
              </div>
            </Card>

            <Card className="mt-3 flex-row items-start gap-3 p-4">
              <TriangleAlert className="mt-px h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
                Premium never renews on its own. When the month is up it simply
                stops, and your events keep running.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumPage;
