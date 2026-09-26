"use client";

import Button from "@/components/ui/button";
import Switch from "@/components/ui/switch";
import { formatNairaAmount } from "@/lib/format-currency";
import { useVendorOrderRealtime } from "@/lib/hooks/use-vendor-order-realtime";
import {
  useAdvanceOrder,
  useCancelVendorOrder,
  useCollectOrder,
  useMyBookings,
  useSetServiceState,
  useVendorQueue,
} from "@/lib/hooks/use-vendor";
import { type VendorOrder } from "@/lib/types/vendor";
import { cn, ROUTES } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  Loader2,
  MessageSquare,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const minutesAgo = (value: string) => {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);

  if (minutes < 1) {
    return "just now";
  }

  return `${minutes} min ago`;
};

const COLUMNS = [
  {
    key: "paid",
    title: "New",
    action: "Start preparing",
    empty: "Nothing new right now.",
  },
  {
    key: "preparing",
    title: "Preparing",
    action: "Mark as ready",
    empty: "Nothing being prepared.",
  },
  {
    key: "ready",
    title: "Ready for pickup",
    action: "Hand over",
    empty: "Nobody waiting to collect.",
  },
] as const;

const OrderCard = ({ order }: { order: VendorOrder }) => {
  const advance = useAdvanceOrder();
  const collect = useCollectOrder();
  const cancel = useCancelVendorOrder();
  const [code, setCode] = useState("");

  const isReady = order.status === "ready";

  const handleAction = () => {
    if (order.status === "paid") {
      advance.mutate({ orderId: order._id, status: "preparing" });
      return;
    }

    if (order.status === "preparing") {
      advance.mutate({ orderId: order._id, status: "ready" });
      return;
    }

    collect.mutate(
      { orderId: order._id, code: code.trim() },
      {
        onSuccess: () => toast.success(`Order ${order.pickupCode} handed over`),
        onError: () =>
          toast.error(
            "That code doesn't match this order. Check it with them.",
          ),
      },
    );
  };

  const pending = advance.isPending || collect.isPending;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-extrabold tabular-nums text-card-foreground">
          {order.pickupCode}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {minutesAgo(order.createdAt)}
        </span>
      </div>

      <ul className="flex flex-col gap-1">
        {order.lines.map((line) => (
          <li key={line.itemId} className="text-sm text-card-foreground">
            {line.quantity} × {line.name}
          </li>
        ))}
      </ul>

      {order.note ? (
        <p className="flex items-start gap-2 rounded-lg bg-[#fff7de] p-2.5 text-xs leading-relaxed text-[#8a5f10]">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {order.note}
        </p>
      ) : null}

      {isReady ? (
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
          Their pickup code
          <input
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 4))
            }
            inputMode="numeric"
            placeholder="4 digits"
            className="h-11 rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus-visible:border-primary"
          />
        </label>
      ) : null}

      <div className="flex items-center gap-2">
        <span className="flex-1 text-sm font-bold tabular-nums text-card-foreground">
          {formatNairaAmount(order.pricing.totalChargedNaira)}
          <span className="ml-1.5 text-xs font-semibold text-primary">
            Paid
          </span>
        </span>

        <Button
          size="sm"
          variant={isReady ? "outline" : "default"}
          loading={pending}
          disabled={isReady && code.trim().length !== 4}
          onClick={handleAction}
        >
          {COLUMNS.find((column) => column.key === order.status)?.action}
        </Button>
      </div>

      <button
        type="button"
        onClick={() =>
          cancel.mutate(
            { orderId: order._id, reason: "Vendor could not fulfil it" },
            {
              onSuccess: () =>
                toast.success("Order cancelled. The buyer is refunded."),
            },
          )
        }
        className="self-start text-xs font-semibold text-muted-foreground hover:text-destructive"
      >
        Can&apos;t make this one
      </button>
    </article>
  );
};

/**
 * The screen a vendor works from on event night, for one event.
 *
 * The event comes from the route rather than being guessed: a vendor can be
 * confirmed for several at once, and picking one for them is how the board
 * ends up empty while orders sit unworked on another night.
 */
const VendorOrderQueueBoard = ({ eventId }: { eventId: string }) => {
  const bookingsQuery = useMyBookings();
  const setService = useSetServiceState();

  const booking =
    (bookingsQuery.data ?? []).find(
      (row) => row.eventId === eventId && row.status === "confirmed",
    ) ?? null;

  const queueQuery = useVendorQueue(eventId);
  const orders = queueQuery.data?.items ?? [];

  useVendorOrderRealtime();

  if (bookingsQuery.isSuccess && !booking) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-sm font-semibold text-foreground">
          You&apos;re not confirmed for this event
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Only events an organizer has confirmed you for can take orders.
        </p>
        <Link
          href={ROUTES.VENDOR_ORDERS}
          className="mt-4 inline-block text-sm font-semibold text-accent-foreground underline-offset-4 hover:underline"
        >
          Back to your events
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <Link
            href={ROUTES.VENDOR_ORDERS}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All events
          </Link>
          <p className="mt-1.5 text-xs font-bold uppercase text-primary">
            {booking?.event?.name ?? "Your event"}
          </p>
          <h1 className="mt-1 text-xl font-bold text-card-foreground">
            Orders
            {queueQuery.isFetching ? (
              <Loader2 className="ml-2 inline h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-3">
            <span className="text-sm font-semibold text-card-foreground">
              Taking orders
            </span>
            <Switch
              checked={Boolean(booking?.acceptingOrders ?? true)}
              disabled={!booking || setService.isPending}
              onCheckedChange={(checked) =>
                booking &&
                setService.mutate({
                  bookingId: booking._id,
                  payload: { acceptingOrders: checked },
                })
              }
              aria-label="Taking orders"
            />
          </label>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Wait</span>
            <span className="min-w-14 text-sm font-bold tabular-nums text-card-foreground">
              {booking?.prepMinutes ? `${booking.prepMinutes} min` : "—"}
            </span>
            {/* The wait time is the vendor's to set: we never guess it. */}
            {([-5, 5] as const).map((step) => (
              <button
                key={step}
                type="button"
                aria-label={step < 0 ? "Shorter wait" : "Longer wait"}
                disabled={!booking}
                onClick={() =>
                  booking &&
                  setService.mutate({
                    bookingId: booking._id,
                    payload: {
                      prepMinutes: Math.max(
                        0,
                        (booking.prepMinutes ?? 10) + step,
                      ),
                    },
                  })
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground hover:bg-secondary"
              >
                {step < 0 ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const cards = orders.filter((order) => order.status === column.key);

          return (
            <section
              key={column.key}
              className="flex min-h-40 flex-col gap-3 rounded-2xl bg-secondary/50 p-3"
            >
              <div className="flex items-center gap-2 px-1">
                <h2 className="text-sm font-bold text-foreground">
                  {column.title}
                </h2>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                    column.key === "paid" && cards.length > 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-border text-foreground",
                  )}
                >
                  {cards.length}
                </span>
              </div>

              {cards.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}

              {cards.length === 0 ? (
                <p className="px-1 py-8 text-center text-xs text-muted-foreground">
                  {column.empty}
                </p>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default VendorOrderQueueBoard;
