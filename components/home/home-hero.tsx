import { buttonVariants } from "@/components/ui/button";
import { POSTER_TONES } from "@/components/vera/event-poster";
import { IMAGES } from "@/lib/images";
import { ROUTES } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

/* Scenes, not events: the hero is decoration, and a made-up event with a date
   and a price would read as a real listing. Real events start one section down. */
const SCENES = [
  { label: "Live jazz", tone: "pink" },
  { label: "Afro beats", tone: "green" },
  { label: "Run clubs", tone: "blue" },
  { label: "Rooftops", tone: "cream" },
] as const;

/**
 * The app's welcome line, then one poster-yellow panel: the scenes as pills
 * along the top, and the crowd standing in it, running off the bottom edge so
 * the illustration's ragged cut never shows.
 */
const HomeHero = () => (
  <section className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-[clamp(32px,5vw,64px)] px-[clamp(16px,4vw,40px)] pt-[clamp(24px,5vw,64px)] pb-[clamp(48px,7vw,96px)]">
    <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-7">
      <h1 style={{ lineHeight: 0.92 }} className="text-[clamp(56px,9vw,128px)] font-extrabold tracking-[-0.05em]">
        find your
        <span className="block text-primary">front row.</span>
      </h1>
      <p className="max-w-[460px] text-[19px] leading-normal text-muted-foreground">
        Rooftops, raves, run clubs and everything in between. Find what&apos;s on, go with your friends, and keep every
        ticket in one place.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href={ROUTES.DOWNLOAD} className={buttonVariants({ variant: "ink", size: "lg" })}>
          Get the app
        </Link>
        <Link href="/events" className={buttonVariants({ variant: "line", size: "lg" })}>
          See what&apos;s on
        </Link>
      </div>
    </div>

    <div className="flex min-w-0 flex-[1_1_440px] flex-col overflow-hidden rounded-[36px] bg-[#E6C56B] text-[#2A220C]">
      <div className="flex flex-col gap-4 p-[clamp(20px,3vw,32px)]">
        <span className="text-sm font-bold">This week in Lagos</span>
        <ul aria-label="Scenes on Vera" className="flex flex-wrap gap-2">
          {SCENES.map((scene) => {
            const colours = POSTER_TONES[scene.tone];
            return (
              <li
                key={scene.label}
                className="rounded-full px-4 py-2 text-[15px] font-bold"
                style={{ backgroundColor: colours.bg, color: colours.fg }}
              >
                {scene.label}
              </li>
            );
          })}
        </ul>
      </div>

      {/* In flow under the pills so they can't overlap, and pulled past the bottom edge so the crowd is cropped like a photo. */}
      <Image
        src={IMAGES.illustrationsCrowd}
        alt="A crowd of friends, illustrated"
        width={876}
        height={804}
        priority
        className="-mb-[9%] h-auto w-[96%] self-center"
      />
    </div>
  </section>
);

export default HomeHero;
