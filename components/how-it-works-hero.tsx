import { Eyebrow } from "@/components/vera/display-heading";

/* The three verbs, stacked and huge, the last one green: the app's heading voice at full size. */
const HowItWorksHero = () => {
  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] pt-[clamp(24px,5vw,64px)] pb-[clamp(32px,5vw,64px)]">
      <Eyebrow>How Vera works</Eyebrow>
      <h1 style={{ lineHeight: 0.9 }} className="mt-5 text-[clamp(64px,11vw,168px)] font-extrabold tracking-[-0.055em] text-foreground">
        find it.
        <span className="block">book it.</span>
        <span className="block text-primary">live it.</span>
      </h1>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-border pt-6">
        <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
          Four steps, no fine print. Here&apos;s exactly what happens from the moment you open Vera to the moment you&apos;re
          walking through the door.
        </p>
        <span className="flex h-11 items-center rounded-full bg-foreground px-5 text-sm font-bold text-background">
          No markup. No fake tickets.
        </span>
      </div>
    </section>
  );
};

export default HowItWorksHero;
