import { Ticket } from "lucide-react";

const HowItWorksHero = () => {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="mx-auto max-w-5xl">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          How Vera works
        </span>

        <h1 className="mt-4 font-bold text-foreground">
          <span className="block text-5xl  sm:text-7xl lg:text-6xl">
            Find it.
          </span>
          <span className="block pl-[6%] text-5xl  text-primary sm:text-7xl lg:text-6xl">
            Book it.
          </span>
          <span className="-rotate-1 block pl-[2%] text-5xl  sm:text-7xl lg:text-6xl">
            Live it.
          </span>
        </h1>

        <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-base">
            Four steps, no fine print. Here&apos;s exactly what happens from the
            moment you open Vera to the moment you&apos;re walking through the
            door.
          </p>

          <div className="flex rotate-3 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
            <Ticket className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              No markup. No fake tickets.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksHero;
