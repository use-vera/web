import { Eyebrow } from "@/components/vera/display-heading";
import VendorPhoto from "@/components/vendors/vendor-photo";
import { VENDOR_TERMS } from "@/lib/vendor-content";

const INCLUDED = [
  "Your vendor page and menu",
  "Unlimited events and orders",
  "Card payments taken for you",
  "Your stall QR code for walk-ups",
  "Payouts straight to your bank",
];

/** The fee as a poster: pink panel, the number set huge, what's included on hairlines, the photo beside it. */
const VendorFees = () => {
  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-[clamp(32px,5vw,64px)]">
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col justify-between gap-8 rounded-[36px] bg-[#F0B9C7] p-[clamp(28px,5vw,56px)] text-[#3B1F27]">
          <div className="flex flex-col gap-4">
            <Eyebrow className="text-[#3B1F27]/70">What it costs</Eyebrow>
            <div className="flex items-end gap-3">
              <span style={{ lineHeight: 0.85 }} className="text-[clamp(110px,15vw,200px)] font-extrabold tracking-[-0.06em]">
                {VENDOR_TERMS.feePercent}%
              </span>
              <span className="pb-3 text-lg font-bold">per order</span>
            </div>
            <p className="max-w-md text-base leading-relaxed text-[#3B1F27]/80">
              Nothing to join, no monthly fee, and nothing to pay on an event where you sell nothing. Organizers may charge a
              stall fee for the spot, and you see it in full before you accept an invitation.
            </p>
          </div>

          <ul className="border-t border-[#3B1F27]/20">
            {INCLUDED.map((item) => (
              <li key={item} className="border-b border-[#3B1F27]/20 py-3.5 text-base font-bold">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <VendorPhoto
          hint="Photo: your food, shot close and warm — the thing people are buying"
          alt="A vendor's food at an event"
          className="min-h-72 overflow-hidden rounded-[36px] lg:min-h-0"
          sizes="(min-width: 1024px) 40vw, 100vw"
          src="/images/vendor-what-it-costs.png"
        />
      </div>
    </section>
  );
};

export default VendorFees;
