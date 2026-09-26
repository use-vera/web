"use client";

import { formatNairaAmount } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

interface QueuedOrder {
  key: number;
  code: string;
  name: string;
  items: string;
  totalNaira: number;
}

/* A fixed loop rather than random data, so the same thing is drawn on the
   server and on the client, and nobody has to wonder what they are seeing. */
const ORDER_POOL = [
  { code: "A51", name: "Tolu", items: "2 × Jollof & chicken, 1 × Chapman", totalNaira: 11000 },
  { code: "A52", name: "Ifeanyi", items: "1 × Small chops (10 pcs)", totalNaira: 3000 },
  { code: "A53", name: "Zainab", items: "3 × Chapman", totalNaira: 6000 },
  { code: "A54", name: "Kunle", items: "1 × Fried rice & turkey", totalNaira: 5500 },
  { code: "A55", name: "Ada", items: "2 × Small chops, 2 × Zobo", totalNaira: 9000 },
];

const VISIBLE = 3;
const ARRIVAL_MS = 4200;

const initialOrders: QueuedOrder[] = ORDER_POOL.slice(0, VISIBLE).map(
  (order, index) => ({ ...order, key: index }),
);

const VendorOrderQueue = ({ className }: { className?: string }) => {
  const reduceMotion = useReducedMotion();
  const [orders, setOrders] = useState<QueuedOrder[]>(initialOrders);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    /* The queue is the whole point of the product, so the mockup shows an
       order arriving rather than sitting still. */
    const id = setInterval(() => {
      setOrders((current) => {
        const nextKey = current[0].key + 1;
        const incoming = ORDER_POOL[nextKey % ORDER_POOL.length];

        return [
          { ...incoming, key: nextKey },
          ...current.slice(0, VISIBLE - 1),
        ];
      });
    }, ARRIVAL_MS);

    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/20",
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <span className="relative flex h-2.5 w-2.5">
          {!reduceMotion ? (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
          ) : null}
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
        <span className="text-sm font-bold text-card-foreground">
          Afrobeats Night Lagos
        </span>
        <span className="ml-auto rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
          Stall 7
        </span>
      </div>

      <div className="flex flex-col p-3">
        <AnimatePresence initial={false} mode="popLayout">
          {orders.map((order, index) => (
            <motion.div
              key={order.key}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: index === VISIBLE - 1 ? 0.55 : 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4 rounded-2xl px-3 py-3.5 not-last:border-b not-last:border-border/70"
            >
              <span className="w-11 shrink-0 text-lg font-extrabold tabular-nums text-card-foreground">
                {order.code}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-card-foreground">
                  {order.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {order.items}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-bold tabular-nums text-card-foreground">
                  {formatNairaAmount(order.totalNaira)}
                </span>
                <span className="block text-[11px] font-bold text-primary">
                  Paid
                </span>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-secondary/60 px-5 py-4">
        <span className="text-xs font-semibold text-muted-foreground">
          Tonight
        </span>
        <span className="text-sm font-extrabold tabular-nums text-card-foreground">
          {formatNairaAmount(186500)}
          <span className="ml-2 text-xs font-semibold text-muted-foreground">
            47 orders
          </span>
        </span>
      </div>
    </div>
  );
};

export default VendorOrderQueue;
