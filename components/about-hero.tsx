import DisplayHeading, { Eyebrow } from "@/components/vera/display-heading";
import { IMAGES } from "@/lib/images";
import Image from "next/image";

const AboutHero = () => {
  return (
    <section className="mx-auto flex max-w-[1240px] flex-wrap items-end gap-[clamp(32px,5vw,64px)] px-[clamp(16px,4vw,40px)] pt-[clamp(24px,5vw,64px)] pb-[clamp(40px,6vw,80px)]">
      <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-6">
        <Eyebrow>About Vera</Eyebrow>
        <DisplayHeading as="h1" lead="the app we wished existed" accent="every weekend." className="text-[clamp(48px,7vw,104px)]" />
        <p className="max-w-[520px] text-lg leading-relaxed text-muted-foreground">
          Vera started with a simple frustration: buying a ticket shouldn&apos;t feel riskier than the event itself. So we
          built a place to find events, buy tickets without getting scammed, and actually remember it after, through
          the moments the people you follow share.
        </p>
      </div>

      <div className="flex min-w-0 flex-[1_1_380px] items-end justify-center overflow-hidden rounded-[32px] bg-[#15C67C] px-6 pt-8">
        <Image src={IMAGES.aboutUs} alt="" unoptimized priority width={520} height={320} className="h-auto w-full max-w-md" />
      </div>
    </section>
  );
};

export default AboutHero;
