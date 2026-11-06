import QrCodePlaceholder from "@/components/qr-code-placeholder";
import DisplayHeading, { Eyebrow } from "@/components/vera/display-heading";
import { ShieldCheck } from "lucide-react";

/** The ink band: verified resale, beside a ticket that shows the one-owner rule. */
const HowItWorksSpotlight = () => {
  return (
    <section className="dark bg-background text-foreground" aria-labelledby="resale">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-[clamp(40px,6vw,80px)] px-[clamp(16px,4vw,40px)] py-[clamp(64px,8vw,120px)]">
        <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-6">
          <Eyebrow>Verified resale</Eyebrow>
          <DisplayHeading id="resale" lead="checked before it's" accent="sold twice." breakBeforeAccent />
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Can&apos;t make it anymore? List your ticket and it goes straight into that event&apos;s verified resale
            marketplace, capped at face value, so nobody profits off a friend&apos;s plans falling through.
          </p>
        </div>

        <div className="flex min-w-0 flex-[1_1_360px] justify-center">
          <div className="flex w-full max-w-[420px] flex-col gap-5 rounded-[32px] bg-card p-7">
            <span className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              Verified
            </span>
            <div className="flex items-center gap-5 rounded-3xl bg-[#F5F3EF] p-4 text-[#16150F]">
              <QrCodePlaceholder className="h-24 w-24 shrink-0 bg-transparent p-0" />
              <span className="flex flex-col gap-1">
                <span className="text-lg font-bold">One owner at a time</span>
                <span className="text-sm text-[#4A4A40]">The old code retires the moment a new one is issued.</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSpotlight;
