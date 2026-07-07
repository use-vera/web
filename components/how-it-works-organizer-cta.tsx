import Link from "next/link";
import { ArrowRight } from "lucide-react";

const HowItWorksOrganizerCta = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-4">
      <Link
        href="/for-organizers"
        className="group flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card px-8 py-8 transition-colors hover:bg-secondary sm:flex-row sm:items-center"
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Hosting an event?
          </span>
          <span className="text-lg font-bold text-card-foreground">
            See how selling tickets on Vera works.
          </span>
        </div>

        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          Learn more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </section>
  );
};

export default HowItWorksOrganizerCta;
