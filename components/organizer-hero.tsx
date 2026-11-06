import { buttonVariants } from "@/components/ui/button";
import DisplayHeading, { Eyebrow } from "@/components/vera/display-heading";
import Link from "next/link";

/* Sits in the dark (organizer) layout: the tokens flip, so ink buttons read paper here. */
const OrganizerHero = () => {
  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] pt-[clamp(24px,5vw,72px)] pb-[clamp(40px,6vw,80px)]">
      <div className="flex max-w-[960px] flex-col gap-7">
        <Eyebrow>For organizers</Eyebrow>
        <DisplayHeading as="h1" lead="hosting?" accent="vera handles the rest." breakBeforeAccent className="text-[clamp(52px,8.5vw,124px)]" />
        <p className="max-w-[560px] text-lg leading-relaxed text-muted-foreground">
          Sell tickets, verify entry, control resale, and get discovered, all from one dashboard, with payouts that land in
          your account automatically.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/organizer/events" className={buttonVariants({ variant: "ink", size: "lg" })}>
            Start hosting free
          </Link>
          <Link href="#pricing" className={buttonVariants({ variant: "line", size: "lg" })}>
            See how payouts work
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OrganizerHero;
