import { buttonVariants } from "@/components/ui/button";
import DisplayHeading from "@/components/vera/display-heading";
import Link from "next/link";

/** The last nudge before the download band: a heading and one button, on a hairline. */
const OrganizerFinalCta = () => {
  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,96px)]">
      <div className="flex flex-wrap items-end justify-between gap-8 border-t border-border pt-10">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-4">
          <DisplayHeading lead="ready to host your" accent="first event?" breakBeforeAccent />
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            It takes about five minutes to list your first event and start selling tickets.
          </p>
        </div>
        <Link href="/organizer/events" className={buttonVariants({ variant: "ink", size: "lg" })}>
          Start hosting free
        </Link>
      </div>
    </section>
  );
};

export default OrganizerFinalCta;
