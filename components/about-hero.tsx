import { IMAGES } from "@/lib/images";
import Image from "next/image";

const AboutHero = () => {
  return (
    <section className="mx-auto max-w-4xl px-6 pt-20 pb-6 text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        About Vera
      </span>

      <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        We&apos;re building the app we wished existed on a Friday night.
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-base">
        Vera started with a simple frustration: buying a ticket shouldn&apos;t
        feel riskier than the event itself. So we built a place to find events,
        buy tickets without getting scammed, and actually remember the night
        after,through the moments the people you follow share.
      </p>

      <div className="mt-10 flex justify-center">
        <Image
          src={IMAGES.aboutUs}
          alt="About Us"
          unoptimized
          priority
          width={520}
          height={320}
          className="w-full max-w-sm rounded-2xl object-cover h-95"
        />
      </div>
    </section>
  );
};

export default AboutHero;
