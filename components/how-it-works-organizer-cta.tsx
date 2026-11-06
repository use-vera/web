import { ArrowRight } from "lucide-react";
import Link from "next/link";

/** A single line across the page to the hosts' side: a hairline row, not a card. */
const HowItWorksOrganizerCta = () => {
  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)]">
      <Link
        href="/for-organizers"
        className="group flex flex-wrap items-center justify-between gap-4 border-y border-border py-8"
      >
        <span className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-muted-foreground">Hosting an event?</span>
          <span className="text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.03em] transition-colors group-hover:text-primary">
            See how selling tickets on Vera works.
          </span>
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
          <ArrowRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </section>
  );
};

export default HowItWorksOrganizerCta;
