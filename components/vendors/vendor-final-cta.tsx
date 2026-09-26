"use client";

import { buttonVariants } from "@/components/ui/button";
import { useVendorEntry } from "@/lib/hooks/use-vendor-entry";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const VendorFinalCta = () => {
  const { startHref, returningHref, hasVendor } = useVendorEntry();

  return (
    <section className="mx-auto max-w-5xl px-6 pb-8">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-14 text-center sm:px-12 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 " />

        <div className="relative flex flex-col items-center gap-5">
          <h2 className="max-w-xl text-3xl font-bold tracking-[-0.01em] text-card-foreground sm:text-4xl">
            {hasVendor
              ? "Your next event is already selling tickets."
              : "The next event is already selling tickets."}
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {hasVendor
              ? "Keep your menu current and answer your invitations from your dashboard."
              : "Setting up takes about three minutes. You can add your menu now and find an event to sell at afterwards."}
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link href={startHref} className={buttonVariants({ size: "lg" })}>
              {hasVendor ? "Open your dashboard" : "Start selling"}
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Someone already selling has no use for a second door into the
                same place, so it is only offered when it leads somewhere new. */}
            {hasVendor ? null : (
              <Link
                href={returningHref}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-foreground/20",
                )}
              >
                I already sell on Vera
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VendorFinalCta;
