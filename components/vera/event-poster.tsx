import { cloudinaryVariant, type ImageVariant } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

/**
 * Flat poster colourways, the same six as the mobile app and seeded the same
 * way, so an event wears one colour everywhere. They stay put in dark mode:
 * a poster is the event's own artwork, not part of the page's chrome.
 */
export const POSTER_TONES = {
  green: { bg: "#15C67C", fg: "#0B1D14" },
  pink: { bg: "#F0B9C7", fg: "#3B1F27" },
  yellow: { bg: "#E6C56B", fg: "#2A220C" },
  blue: { bg: "#8DC7EF", fg: "#0F2633" },
  cream: { bg: "#F5F3EF", fg: "#16150F" },
  ink: { bg: "#26251C", fg: "#F5F3EF" },
} as const;

export type PosterTone = keyof typeof POSTER_TONES;
const TONE_ORDER = Object.keys(POSTER_TONES) as PosterTone[];

/** The same event always gets the same colour (the app's hash, kept identical). */
export const toneFor = (seed: string): PosterTone => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return TONE_ORDER[hash % TONE_ORDER.length];
};

interface EventPosterProps {
  title: string;
  /** Small line at the top, e.g. "SAT 8PM". */
  tag?: string;
  imageUrl?: string | null;
  /** Usually the event id. */
  seed: string;
  tone?: PosterTone;
  imageVariant?: ImageVariant;
  className?: string;
  /** Sizes the name; posters range from a 48px thumb to a page-wide banner. */
  titleClassName?: string;
  /** A pill or two over the poster's top-right corner. */
  badge?: React.ReactNode;
}

/**
 * An event's poster. With artwork it shows the artwork; without, a flat
 * colour block with the name set heavy and the Vera arch as quiet texture.
 */
const EventPoster = ({
  title,
  tag,
  imageUrl,
  seed,
  tone,
  imageVariant = "card",
  className,
  titleClassName = "text-3xl",
  badge,
}: EventPosterProps) => {
  const resolvedTone = tone ?? toneFor(seed);
  const colours = POSTER_TONES[resolvedTone];
  const src = cloudinaryVariant(imageUrl, imageVariant);

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[28px]",
        /* Cream is the page colour: an inset edge keeps an artless cream poster from vanishing. */
        resolvedTone === "cream" && !src && "ring-1 ring-border ring-inset",
        className,
      )}
      style={{ backgroundColor: colours.bg, color: colours.fg }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- Cloudinary already serves sized variants.
        <img src={src} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      ) : (
        <>
          <svg
            viewBox="0 0 120 120"
            aria-hidden="true"
            className="pointer-events-none absolute -right-[12%] -bottom-[18%] -z-10 h-[90%] opacity-[0.09]"
          >
            <path d="M28 100 L28 58 A32 32 0 0 1 92 58 L92 100" fill="none" stroke="currentColor" strokeWidth={15} strokeLinecap="round" />
            <path d="M44 76 L60 56 L76 76" fill="none" stroke="currentColor" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex h-full flex-col justify-between gap-3 p-[8%]">
            {tag ? <span className="text-xs font-bold uppercase">{tag}</span> : <span />}
            <span
              aria-hidden="true"
              style={{ lineHeight: 0.9 }}
              className={cn("line-clamp-4 font-extrabold uppercase tracking-[-0.04em] break-words", titleClassName)}
            >
              {title}
            </span>
          </div>
        </>
      )}
      {badge ? <div className="absolute top-3 right-3 flex gap-2">{badge}</div> : null}
    </div>
  );
};

export default EventPoster;
