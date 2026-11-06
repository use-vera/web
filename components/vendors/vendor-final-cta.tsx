"use client";

import { buttonVariants } from "@/components/ui/button";
import { useVendorEntry } from "@/lib/hooks/use-vendor-entry";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const VendorFinalCta = () => {
  const { startHref, returningHref, hasVendor } = useVendorEntry();

  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,96px)]">
      <div className="flex flex-wrap items-end justify-between gap-8 border-t border-border pt-10">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-4">
          <h2 style={{ lineHeight: 0.92 }} className="text-[clamp(40px,5.5vw,80px)] font-extrabold tracking-[-0.05em] text-foreground">
            {hasVendor ? "your next event is" : "the next event is"}
            <span className="block text-primary">already selling.</span>
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            {hasVendor
              ? "Keep your menu current and answer your invitations from your dashboard."
              : "Setting up takes about three minutes. You can add your menu now and find an event to sell at afterwards."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={startHref} className={buttonVariants({ variant: "ink", size: "lg" })}>
            {hasVendor ? "Open your dashboard" : "Start selling"}
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Someone already selling has no use for a second door into the
              same place, so it is only offered when it leads somewhere new. */}
          {hasVendor ? null : (
            <Link href={returningHref} className={buttonVariants({ variant: "line", size: "lg" })}>
              I already sell on Vera
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default VendorFinalCta;
