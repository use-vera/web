import { buttonVariants } from "@/components/ui/button";
import DisplayHeading from "@/components/vera/display-heading";
import { ROUTES } from "@/lib/utils";
import Link from "next/link";

const POINTS = [
  { title: "Sell tickets and extras", text: "Tiers, presales, promo codes and add-ons, paid through Paystack." },
  { title: "Run the door", text: "Scan from any phone, even offline, with live counts as people arrive." },
  { title: "Bring in vendors", text: "Invite food and drink stalls; guests order from their phones." },
  { title: "Get paid", text: "Payouts to your bank after the event, every naira itemised." },
];

/** The second ink band: for the people who run the events. Nothing invented, just what the tools do. */
const HomeHosts = () => (
  <section className="dark bg-background text-foreground" aria-labelledby="hosts">
    <div className="mx-auto flex max-w-[1240px] flex-col gap-12 px-[clamp(16px,4vw,40px)] py-[clamp(64px,8vw,120px)]">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <DisplayHeading id="hosts" lead="host the event." accent="we'll do the door." breakBeforeAccent className="flex-[1_1_480px]" />
        <div className="flex flex-wrap gap-3">
          <Link href="/for-organizers" className={buttonVariants({ variant: "ink", size: "lg" })}>
            Start hosting
          </Link>
          <Link href={ROUTES.FOR_VENDORS} className={buttonVariants({ variant: "line", size: "lg" })}>
            Sell as a vendor
          </Link>
        </div>
      </div>
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] border-t border-border">
        {POINTS.map((point, index) => (
          <li key={point.title} className="flex flex-col gap-2 border-b border-border py-6 pr-6">
            <span className="text-[13px] font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-xl font-bold tracking-[-0.01em]">{point.title}</span>
            <span className="text-[15px] leading-normal text-muted-foreground">{point.text}</span>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default HomeHosts;
