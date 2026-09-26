import VendorPhoto from "@/components/vendors/vendor-photo";
import { VENDOR_TERMS } from "@/lib/vendor-content";
import { Check } from "lucide-react";

const INCLUDED = [
  "Your vendor page and menu",
  "Unlimited events and orders",
  "Card payments taken for you",
  "Your stall QR code for walk-ups",
  "Payouts straight to your bank",
];

const VendorFees = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-8 sm:p-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              What it costs
            </span>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-6xl font-bold leading-none tracking-[-0.03em] text-card-foreground sm:text-7xl">
                {VENDOR_TERMS.feePercent}%
              </span>
              <span className="pb-2 text-base font-semibold text-muted-foreground">
                per order
              </span>
            </div>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Nothing to join, no monthly fee, and nothing to pay on an event
              where you sell nothing. Organizers may charge a stall fee for the
              spot, and you see it in full before you accept an invitation.
            </p>
          </div>

          <ul className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-card-foreground"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <VendorPhoto
          hint="Photo: your food, shot close and warm — the thing people are buying"
          alt="A vendor's food at an event"
          className="min-h-72 lg:min-h-0 "
          sizes="(min-width: 1024px) 40vw, 100vw"
          src="/images/vendor-what-it-costs.png"
        />
      </div>
    </section>
  );
};

export default VendorFees;
