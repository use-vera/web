"use client";

import EventPoster, { POSTER_TONES, toneFor } from "@/components/vera/event-poster";
import { dayLabel, placeOf, priceTag, shortWhen } from "@/components/vera/event-format";
import { type PublicEventApi } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AuthEventsCarouselProps {
  events: PublicEventApi[];
  className?: string;
}

const ROTATE_MS = 4500;

/**
 * Beside the auth forms: real upcoming events, one at a time. The whole panel
 * takes the event's poster colour, the artwork sits inset at the top, and the
 * name is set big on the colour underneath: no caption card over the photo.
 */
const AuthEventsCarousel = ({ events, className }: AuthEventsCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || events.length <= 1) {
      return;
    }

    const id = setInterval(() => {
      setIndex((current) => (current + 1) % events.length);
    }, ROTATE_MS);

    return () => clearInterval(id);
  }, [paused, events.length]);

  if (events.length === 0) {
    return null;
  }

  const safeIndex = index % events.length;
  const event = events[safeIndex];
  const tone = toneFor(event._id);
  const colours = POSTER_TONES[tone];
  const when = event.nextOccurrenceAt || event.startsAt;

  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col gap-3 overflow-hidden p-3 transition-colors duration-500 sm:h-full sm:w-56",
        tone === "cream" && "ring-1 ring-border ring-inset",
        className,
      )}
      style={{ backgroundColor: colours.bg, color: colours.fg }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* With no artwork, the inset shows the date in ink rather than repeating the name. */}
      <EventPoster
        key={event._id}
        seed={event._id}
        tone={event.imageUrl ? tone : "ink"}
        title={dayLabel(when)}
        imageUrl={event.imageUrl}
        imageVariant="hero"
        className="min-h-40 flex-1 rounded-[24px] animate-in fade-in duration-500"
        titleClassName="text-[clamp(28px,4vw,72px)]"
      />

      <div key={`${event._id}-info`} className="flex flex-col gap-3 px-[clamp(8px,1.6vw,20px)] pt-2 pb-[clamp(8px,1.6vw,20px)] animate-in fade-in slide-in-from-bottom-2 duration-500">
        {events.length > 1 ? (
          <div className="flex gap-1.5">
            {events.map((item, i) => (
              <button
                key={item._id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show event ${i + 1}`}
                aria-current={i === safeIndex}
                className={cn("h-1 flex-1 rounded-full transition-opacity", i === safeIndex ? "bg-current" : "bg-current opacity-25")}
              />
            ))}
          </div>
        ) : null}

        <span className="text-sm font-bold opacity-75">Coming up on Vera</span>
        <h3 style={{ lineHeight: 0.95 }} className="line-clamp-2 text-[clamp(24px,3.4vw,56px)] font-extrabold tracking-[-0.04em]">
          {event.name}
        </h3>
        <span className="text-[15px] font-semibold opacity-80">
          {[shortWhen(when), placeOf(event), priceTag(event)].filter(Boolean).join(" · ")}
        </span>
      </div>
    </div>
  );
};

export default AuthEventsCarousel;
