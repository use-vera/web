import { Check } from "lucide-react";

const included = [
  "Unlimited events and ticket tiers",
  "QR check-in for every ticket",
  "Automatic payouts, no invoicing",
  "Event chat and moments feed",
];

const OrganizerPricing = () => {
  return (
    <section id="pricing" className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Pricing
          </span>
          <h2 className="text-3xl font-bold text-card-foreground sm:text-4xl">
            Free to list. 5% only when you sell.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            No monthly subscription, no setup fee. We only make money when
            your event does.
          </p>
        </div>

        <ul className="mx-auto mt-8 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-3 w-3 text-primary" />
              </span>
              <span className="text-sm font-medium text-card-foreground">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default OrganizerPricing;
