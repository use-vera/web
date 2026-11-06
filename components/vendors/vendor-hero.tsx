"use client";

import { buttonVariants } from "@/components/ui/button";
import VendorOrderQueue from "@/components/vendors/vendor-order-queue";
import { useVendorEntry } from "@/lib/hooks/use-vendor-entry";
import { VENDOR_TERMS } from "@/lib/vendor-content";
import { ArrowRight, Banknote, Check } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
});

const VendorHero = () => {
  const { startHref, hasVendor } = useVendorEntry();

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 "
      />

      <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-14 px-[clamp(16px,4vw,40px)] pt-[clamp(24px,5vw,72px)] pb-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:pb-20">
        <div>
          <motion.span
            {...enter(0)}
            className="text-sm font-semibold text-muted-foreground"
          >
            For vendors
          </motion.span>

          <motion.h1
            {...enter(0.08)}
            style={{ lineHeight: 0.92 }}
            className="mt-6 text-[clamp(52px,7.5vw,112px)] font-extrabold tracking-[-0.05em] text-foreground"
          >
            your stall,
            <span className="block text-primary">without the wait.</span>
          </motion.h1>

          <motion.p
            {...enter(0.16)}
            className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
          >
            Attendees order and pay from wherever they are standing. You get a
            clean list of orders, a code to check at handover, and your money in
            your bank after the event.
          </motion.p>

          <motion.div
            {...enter(0.24)}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link href={startHref} className={buttonVariants({ variant: "ink", size: "lg" })}>
              {hasVendor ? "Open your dashboard" : "Start selling"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className={buttonVariants({ variant: "line", size: "lg" })}
            >
              See how it works
            </Link>
          </motion.div>

          <motion.ul
            {...enter(0.32)}
            className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[15px] text-muted-foreground"
          >
            {[
              "A bank account is all you need",
              "No CAC or ID to start",
              `No monthly fee, ${VENDOR_TERMS.feePercent}% per order`,
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
          className="relative mx-auto w-full max-w-md lg:mx-0"
        >
          <VendorOrderQueue />

          {/* The payout card sits half off the queue: the two halves of the
              promise, taking the order and being paid for it. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
            className="absolute -bottom-7 -left-4 flex items-center gap-3 rounded-3xl border-[1.5px] border-border bg-background px-4 py-3.5 sm:-left-10"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <Banknote className="h-5 w-5 text-accent-foreground" />
            </span>
            <span>
              <span className="block text-sm font-bold text-foreground">
                ₦167,850 on its way
              </span>
              <span className="block text-xs text-muted-foreground">
                To your bank, {VENDOR_TERMS.payoutDelayHours}h after the event
              </span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default VendorHero;
