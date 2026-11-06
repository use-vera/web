import { Eyebrow } from "@/components/vera/display-heading";

const included = [
  "Unlimited events and ticket tiers",
  "QR check-in for every ticket",
  "Automatic payouts, no invoicing",
  "Event chat and moments feed",
];

/** The price as a poster: one green panel, the number set huge, what's included on hairlines beside it. */
const OrganizerPricing = () => {
  return (
    <section id="pricing" className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-[clamp(32px,5vw,64px)]">
      <div className="flex flex-wrap gap-[clamp(28px,5vw,64px)] rounded-[36px] bg-[#15C67C] p-[clamp(28px,5vw,64px)] text-[#0B1D14]">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-5">
          <Eyebrow className="text-[#0B1D14]/70">Pricing</Eyebrow>
          <span style={{ lineHeight: 0.85 }} className="text-[clamp(120px,18vw,240px)] font-extrabold tracking-[-0.06em]">
            5%
          </span>
          <h2 className="text-[clamp(26px,3vw,38px)] leading-tight font-extrabold tracking-[-0.03em]">
            Free to list. 5% only when you sell.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-[#0B1D14]/75">
            No monthly subscription, no setup fee. We only make money when your event does.
          </p>
        </div>
        <ul className="flex min-w-0 flex-[1_1_320px] flex-col justify-end border-t border-[#0B1D14]/20">
          {included.map((item) => (
            <li key={item} className="border-b border-[#0B1D14]/20 py-4 text-lg font-bold">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default OrganizerPricing;
