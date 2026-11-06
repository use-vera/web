import { buttonVariants } from "@/components/ui/button";
import DisplayHeading, { Eyebrow } from "@/components/vera/display-heading";
import EventPoster from "@/components/vera/event-poster";
import { IMAGES } from "@/lib/images";
import { ROUTES } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const POINTS = [
  "Three picks, each with a reason: who's going, what you rated before, the weather.",
  "Reads your calendar on your phone. Her servers only ever see when you're busy.",
  "Watches resale prices and tells you when one drops under your line.",
];

/* A sample of the chat screen, so the scene names stay generic like the hero. */
const PICKS = [
  { seed: "pick-1", tone: "yellow" as const, label: "AFRO", name: "Afrobeats in the park", meta: "Saturday · Victoria Island", why: "Two of your friends are going", strong: true },
  { seed: "pick-2", tone: "pink" as const, label: "JAZZ", name: "A jazz evening", meta: "Sunday · Ikoyi", why: "Live music, done by ten", strong: false },
];

/** The ink band: what Vera does, beside a sample of her chat over the old "on the phone" illustration. */
const HomeVera = () => (
  <section className="dark bg-background text-foreground" aria-labelledby="meet-vera">
    <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-[clamp(40px,6vw,80px)] px-[clamp(16px,4vw,40px)] py-[clamp(64px,8vw,120px)]">
      <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-6">
        <Eyebrow>Meet Vera</Eyebrow>
        <DisplayHeading id="meet-vera" lead="ask what to do" accent="tonight." breakBeforeAccent />
        <p className="max-w-[440px] text-lg leading-relaxed text-muted-foreground">
          She picks three, says why, and holds a ticket for ten minutes while you decide. Holding isn&apos;t buying: Vera
          never spends your money.
        </p>
        <ol className="max-w-[460px] border-t border-border">
          {POINTS.map((point, index) => (
            <li key={point} className="flex gap-3.5 border-b border-border py-3.5 text-[15px] text-muted-foreground">
              <span className="font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
              <span>{point}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex w-full min-w-0 max-w-[520px] flex-[1_1_420px] flex-col gap-3" aria-hidden="true">
        <div className="flex h-[260px] items-end overflow-hidden rounded-[28px] bg-[#173B2A] px-6">
          <Image src={IMAGES.illustrationsOnPhone} alt="" width={1000} height={1000} className="h-[250px] w-auto" />
        </div>
        <div className="-mt-36 max-w-[80%] self-end rounded-[22px] rounded-br-md border-4 border-background bg-primary px-[18px] py-3.5 text-base font-semibold text-primary-foreground">
          What&apos;s good this Saturday, under ₦15k?
        </div>
        <div className="max-w-[88%] self-start rounded-[22px] rounded-bl-md bg-card px-[18px] py-3.5 text-base leading-snug">
          Two of your friends are at Afrobeats in the park on the Island. If you want something calmer, there&apos;s jazz on
          Sunday, done by ten.
        </div>
        {PICKS.map((pick) => (
          <div
            key={pick.seed}
            className={`flex items-center gap-3.5 rounded-[18px] border-[1.5px] p-3 ${pick.strong ? "border-primary" : "border-border"}`}
          >
            <EventPoster seed={pick.seed} tone={pick.tone} title={pick.label} className="h-[52px] w-[52px] shrink-0 rounded-xl" titleClassName="text-[9px]" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-base font-bold">{pick.name}</span>
              <span className="text-[13px] text-muted-foreground">{pick.meta}</span>
              <span className="text-[13px] text-foreground/80">{pick.why}</span>
            </span>
          </div>
        ))}
        <span className="flex h-11 items-center self-start rounded-full border-[1.5px] border-border px-[18px] text-sm font-semibold">
          Hold 1 ticket for 10 min
        </span>
      </div>
      <div className="w-full">
        <Link href={ROUTES.DOWNLOAD} className={buttonVariants({ variant: "ink", size: "lg" })}>
          Ask Vera in the app
        </Link>
      </div>
    </div>
  </section>
);

export default HomeVera;
