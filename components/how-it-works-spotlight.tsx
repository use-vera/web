import QrCodePlaceholder from "@/components/qr-code-placeholder";
import { ShieldCheck } from "lucide-react";

const HowItWorksSpotlight = () => {
  return (
    <section className="dark relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-background"
        style={{ clipPath: "polygon(0 7%, 100% 0%, 100% 93%, 0% 100%)" }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 text-foreground md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-4">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <ShieldCheck className="h-4 w-4" />
            Verified resale
          </span>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Every ticket is checked before it&apos;s sold twice.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-foreground/70">
            Can&apos;t make it anymore? List your ticket and it goes straight
            into that event&apos;s verified resale marketplace, capped at face
            value, so nobody profits off a friend&apos;s plans falling through.
          </p>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="flex items-center gap-4 rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
            <QrCodePlaceholder className="h-20 w-20 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
              <span className="text-sm font-bold">One owner at a time</span>
              <span className="text-xs text-foreground/60">
                Old code retires the moment a new one is issued.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSpotlight;
