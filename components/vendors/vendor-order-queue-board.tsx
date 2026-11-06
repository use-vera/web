"use client";

import { OrganizerField } from "@/components/organizer/organizer-field";
import { EmptyState, PageHeader, Panel } from "@/components/organizer/organizer-primitives";
import Button, { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { POSTER_TONES, type PosterTone } from "@/components/vera/event-poster";
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
import { ROUTES } from "@/lib/utils";
import {
  Clock,
  ListChecks,
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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));

const COLUMNS = [
  { key: "paid", title: "New", action: "Start preparing", empty: "Nothing new right now.", tone: "green" },
  { key: "preparing", title: "Preparing", action: "Mark as ready", empty: "Nothing being prepared.", tone: "yellow" },
  { key: "ready", title: "Ready for pickup", action: "Hand over", empty: "Nobody waiting to collect.", tone: "blue" },
] as const satisfies readonly { key: string; title: string; action: string; empty: string; tone: PosterTone }[];

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
    <article className="flex flex-col gap-3 rounded-[22px] border-[1.5px] border-border bg-background p-4">
      <div className="flex items-baseline gap-2">
        <span className="text-[30px] leading-none font-extrabold tracking-[-0.04em] tabular-nums">{order.pickupCode}</span>
        <span className="ml-auto text-[13px] font-semibold text-muted-foreground">{minutesAgo(order.createdAt)}</span>
      </div>

      <ul className="flex flex-col gap-1">
        {order.lines.map((line) => (
          <li key={line.itemId} className="flex gap-2 text-[15px]">
            <span className="font-bold tabular-nums">{line.quantity}×</span>
            <span className="min-w-0">{line.name}</span>
          </li>
        ))}
      </ul>

      {order.note ? (
        <p
          className="flex items-start gap-2 rounded-[14px] p-3 text-[13px] leading-relaxed font-semibold"
          style={{ backgroundColor: POSTER_TONES.yellow.bg, color: POSTER_TONES.yellow.fg }}
        >
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {order.note}
        </p>
      ) : null}

      {isReady ? (
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Their pickup code</span>
          <OrganizerField
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
            inputMode="numeric"
            autoComplete="off"
            placeholder="4 digits"
            className="text-lg font-bold tracking-normal tabular-nums"
          />
        </label>
      ) : null}

      <div className="flex items-center gap-2 border-t-[1.5px] border-dashed border-border pt-3">
        <span className="flex flex-1 flex-col">
          <span className="text-[15px] font-bold tabular-nums">{formatNairaAmount(order.pricing.totalChargedNaira)}</span>
          <span className="text-xs font-semibold text-primary">Paid</span>
        </span>

        <Button size="sm" variant="ink" loading={pending} disabled={isReady && code.trim().length !== 4} onClick={handleAction}>
          {COLUMNS.find((column) => column.key === order.status)?.action}
        </Button>
      </div>

      <button
        type="button"
        disabled={cancel.isPending}
        onClick={() =>
          cancel.mutate(
            { orderId: order._id, reason: "Vendor could not fulfil it" },
            {
              onSuccess: () => toast.success("Order cancelled. The buyer is refunded."),
              onError: () => toast.error("Couldn't cancel that order. Try again."),
            },
          )
        }
        className="cursor-pointer self-start text-[13px] font-semibold text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
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

  const stepWait = (step: number) => {
    if (!booking) {
      return;
    }

    setService.mutate({ bookingId: booking._id, payload: { prepMinutes: Math.max(0, (booking.prepMinutes ?? 10) + step) } });
  };

  if (bookingsQuery.isSuccess && !booking) {
    return (
      <div className="pt-[clamp(20px,3vw,40px)]">
        <Panel>
          <EmptyState
            icon={<ListChecks className="h-6 w-6" />}
            title="you're not confirmed for this event"
            description="Only events an organizer has confirmed your stall for can take orders."
            action={
              <Link href={ROUTES.VENDOR_ORDERS} className={buttonVariants({ variant: "ink", size: "sm" })}>
                Back to your events
              </Link>
            }
          />
        </Panel>
      </div>
    );
  }

  const event = booking?.event;
  const accepting = Boolean(booking?.acceptingOrders ?? true);

  return (
    <div className="flex flex-col pb-10">
      <PageHeader
        back={{ href: ROUTES.VENDOR_ORDERS, label: "All events" }}
        lead="the"
        accent="queue."
        description={
          event ? (
            <span className="flex items-center gap-2">
              {event.name} · {formatDate(event.startsAt)}
              {queueQuery.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            </span>
          ) : (
            <Skeleton className="h-4 w-56" />
          )
        }
        actions={
          <>
            <label
              className="flex h-12 cursor-pointer items-center gap-3 rounded-full border-[1.5px] border-border pr-2 pl-4 transition-colors"
              style={accepting ? undefined : { backgroundColor: POSTER_TONES.pink.bg, color: POSTER_TONES.pink.fg, borderColor: "transparent" }}
            >
              <span className="text-sm font-bold">{accepting ? "Taking orders" : "Paused"}</span>
              <Switch
                checked={accepting}
                disabled={!booking || setService.isPending}
                onCheckedChange={(checked) => booking && setService.mutate({ bookingId: booking._id, payload: { acceptingOrders: checked } })}
                aria-label="Taking orders"
              />
            </label>

            {/* The wait time is the vendor's to set: we never guess it. */}
            <div className="flex h-12 items-center gap-1 rounded-full border-[1.5px] border-border px-1.5">
              <button
                type="button"
                aria-label="Shorter wait"
                disabled={!booking}
                onClick={() => stepWait(-5)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-secondary disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex min-w-[112px] items-center justify-center gap-1.5 text-sm font-bold tabular-nums">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {booking?.prepMinutes ? `${booking.prepMinutes} min` : "Wait not set"}
              </span>
              <button
                type="button"
                aria-label="Longer wait"
                disabled={!booking}
                onClick={() => stepWait(5)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-secondary disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </>
        }
      />

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const cards = orders.filter((order) => order.status === column.key);
          const colours = POSTER_TONES[column.tone];

          return (
            <section key={column.key} aria-label={column.title} className="flex min-h-48 flex-col gap-2.5 rounded-[28px] border-[1.5px] border-border p-2.5">
              <div className="flex items-center justify-between rounded-[20px] px-4 py-3" style={{ backgroundColor: colours.bg, color: colours.fg }}>
                <h2 className="text-[15px] font-bold">{column.title}</h2>
                <span className="text-[22px] leading-none font-extrabold tracking-[-0.03em] tabular-nums">{cards.length}</span>
              </div>

              {queueQuery.isPending ? <Skeleton className="h-40 rounded-[22px]" /> : null}

              {cards.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}

              {!queueQuery.isPending && cards.length === 0 ? (
                <p className="flex flex-1 items-center justify-center rounded-[22px] border-[1.5px] border-dashed border-border px-4 py-10 text-center text-[13px] font-semibold text-muted-foreground">
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
