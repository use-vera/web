"use client";

import EventThumbnail from "@/components/event-thumbnail";
import { formatEventDate } from "@/lib/format-date";
import { type PublicEventApi } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { Calendar, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface AuthEventsCarouselProps {
  events: PublicEventApi[];
  className?: string;
}

const ROTATE_MS = 4500;

/**
 * Desktop-only side panel for the auth modal: a slow auto-rotating preview of
 * real upcoming events, so signing up reads as "here's what you're signing up
 * for" rather than a decorative sidebar.
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

  return (
    <div
      className={cn(
        "dark relative w-full shrink-0 overflow-hidden bg-background text-foreground sm:h-full sm:w-56",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-full min-h-52">
        <EventThumbnail
          imageUrl={event.imageUrl}
          alt={event.name}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/55 to-black/15" />

        <span className="absolute top-4 left-4 text-[10px] font-bold text-white/70 uppercase">
          Events we have for you
        </span>

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
          <h3 className="line-clamp-2 text-base leading-snug font-bold text-white">
            {event.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-white/80">
            <Calendar className="h-3 w-3 shrink-0" />
            {formatEventDate(event.nextOccurrenceAt)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/80">
            <Users className="h-3 w-3 shrink-0" />
            {event.soldTickets} going
          </div>
        </div>
      </div>

      {events.length > 1 ? (
        <div className="absolute top-16 right-4 flex flex-col gap-1.5">
          {events.map((item, i) => (
            <button
              key={item._id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show event ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === safeIndex ? "h-4 w-1.5 bg-primary" : "w-1.5 bg-white/40",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AuthEventsCarousel;
