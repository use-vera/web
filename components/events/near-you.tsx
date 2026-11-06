"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { POSTER_TONES, toneFor } from "@/components/vera/event-poster";
import { placeOf, priceTag, shortWhen } from "@/components/vera/event-format";
import NearYouMap, { type NearYouPin } from "@/components/events/near-you-map";
import { distanceKm, formatDistance, roughDriveMinutes, type LatLng } from "@/lib/geo";
import { type PublicEventApi } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { cloudinaryVariant } from "@/lib/cloudinary";
import { X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface NearYouProps {
  status: "pending" | "granted" | "denied";
  origin: LatLng | null;
  events: PublicEventApi[];
  loading: boolean;
  onRetry: () => void;
}

interface NearbyEvent {
  event: PublicEventApi;
  km: number;
}

const byDistance = (origin: LatLng, events: PublicEventApi[]): NearbyEvent[] =>
  events
    .filter((event) => typeof event.latitude === "number" && typeof event.longitude === "number")
    .map((event) => ({
      event,
      km: distanceKm(origin, { latitude: event.latitude as number, longitude: event.longitude as number }),
    }))
    .sort((a, b) => a.km - b.km);

/* The pin's event, on a card pinned to the bottom of the map. */
const EventPreview = ({ item, onClose }: { item: NearbyEvent; onClose: () => void }) => {
  const { event, km } = item;
  const colours = POSTER_TONES[toneFor(event._id)];
  const image = cloudinaryVariant(event.imageUrl, "thumb");

  return (
    <div className="absolute inset-x-3 bottom-3 z-[1000] flex items-center gap-3.5 rounded-3xl bg-background p-3 pr-4 text-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
      <span
        aria-hidden="true"
        className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl text-xs font-extrabold uppercase"
        style={{ backgroundColor: colours.bg, color: colours.fg }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- Cloudinary already serves sized variants.
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          formatDistance(km)
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-base font-bold">{event.name}</span>
        <span className="truncate text-[13px] text-muted-foreground">
          {[shortWhen(event.nextOccurrenceAt || event.startsAt), placeOf(event), priceTag(event)].filter(Boolean).join(" · ")}
        </span>
        <span className="text-[13px] font-semibold text-muted-foreground">
          {formatDistance(km)} away · ≈ {roughDriveMinutes(km)} min drive
        </span>
      </span>
      <Link href={`/events/${event._id}`} className={cn(buttonVariants({ variant: "ink", size: "sm" }), "shrink-0")}>
        View
      </Link>
      <button type="button" onClick={onClose} aria-label="Close preview" className="-mr-1 shrink-0 cursor-pointer rounded-full p-1.5 text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

/* Several events at one address: a short list on the map, each one a link. */
const SpotPreview = ({ items, onClose }: { items: NearbyEvent[]; onClose: () => void }) => (
  <div className="absolute inset-x-3 bottom-3 z-[1000] flex max-h-[70%] flex-col rounded-3xl bg-background text-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2">
      <span className="text-sm font-bold">
        {items.length} events here · {formatDistance(items[0].km)} away
      </span>
      <button type="button" onClick={onClose} aria-label="Close list" className="-mr-1 cursor-pointer rounded-full p-1.5 text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
    <ul data-lenis-prevent className="min-h-0 overflow-y-auto px-2 pb-2">
      {items.map(({ event }) => {
        const colours = POSTER_TONES[toneFor(event._id)];
        return (
          <li key={event._id}>
            <Link href={`/events/${event._id}`} className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-foreground/5">
              <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full border border-foreground/25" style={{ backgroundColor: colours.bg }} />
              <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{event.name}</span>
              <span className="shrink-0 text-[13px] text-muted-foreground">
                {shortWhen(event.nextOccurrenceAt || event.startsAt)} · {priceTag(event)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  </div>
);

/**
 * Always on the events page (until you search): every event within 25 km on
 * a real OpenStreetMap, the nearest four numbered and repeated as cards. A pin
 * opens that event's preview right on the map.
 */
const NearYou = ({ status, origin, events, loading, onRetry }: NearYouProps) => {
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const nearby = useMemo(() => (origin ? byDistance(origin, events) : []), [origin, events]);
  const placed = nearby.slice(0, 4);
  /* Stable between renders so the map only redraws when the events change. */
  const pins = useMemo<NearYouPin[]>(
    () =>
      nearby.map(({ event }, index) => {
        const colours = POSTER_TONES[toneFor(event._id)];
        return {
          id: event._id,
          label: index < 4 ? String(index + 1) : null,
          latitude: event.latitude as number,
          longitude: event.longitude as number,
          background: colours.bg,
          foreground: colours.fg,
        };
      }),
    [nearby],
  );
  const selected = selectedIds ? nearby.filter((item) => selectedIds.includes(item.event._id)) : [];
  const caption =
    status === "granted" ? "Nearest first · within 25 km" : status === "pending" ? "Finding where you are…" : "Location is off";

  return (
    <section aria-labelledby="near-you" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="near-you" style={{ lineHeight: 0.95 }} className="text-[clamp(32px,3.6vw,48px)] font-extrabold tracking-[-0.04em]">
          near <span className="text-primary">you.</span>
        </h2>
        <span className="text-sm text-muted-foreground">{caption}</span>
      </div>

      {status === "denied" ? (
        <div className="dark flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-background p-[clamp(24px,3vw,36px)] text-foreground">
          <span className="flex flex-[1_1_360px] flex-col gap-1.5">
            <span className="text-2xl font-extrabold tracking-[-0.03em]">see what&apos;s around the corner.</span>
            <span className="text-[15px] leading-normal text-muted-foreground">
              Allow location to see the nearest events. It stays in your browser; we only use it to sort by distance.
            </span>
          </span>
          <button type="button" onClick={onRetry} className={buttonVariants({ variant: "ink", size: "default" })}>
            Use my location
          </button>
        </div>
      ) : status === "pending" || loading ? (
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-[340px] min-w-0 flex-[1_1_380px] rounded-[28px]" />
          <div className="grid min-w-0 flex-[1.3_1_460px] grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-40 rounded-3xl" />
            ))}
          </div>
        </div>
      ) : placed.length ? (
        <div className="flex flex-wrap items-stretch gap-4">
          {origin ? (
            <div className="relative min-h-[340px] min-w-0 flex-[1_1_380px] overflow-hidden rounded-[28px] bg-muted">
              <NearYouMap origin={origin} pins={pins} selectedIds={selectedIds} onSelect={setSelectedIds} className="absolute inset-0" />
              {selected.length === 1 ? <EventPreview item={selected[0]} onClose={() => setSelectedIds(null)} /> : null}
              {selected.length > 1 ? <SpotPreview items={selected} onClose={() => setSelectedIds(null)} /> : null}
            </div>
          ) : null}

          <ol className="grid min-w-0 flex-[1.3_1_460px] grid-cols-1 gap-4 sm:grid-cols-2">
            {placed.map((item, index) => {
              const colours = POSTER_TONES[toneFor(item.event._id)];
              return (
                <li key={item.event._id}>
                  <Link
                    href={`/events/${item.event._id}`}
                    className={cn(
                      "flex h-full min-h-40 flex-col justify-between gap-4 rounded-3xl p-[18px] transition-transform hover:-translate-y-0.5",
                      toneFor(item.event._id) === "cream" && "border-[1.5px] border-border",
                    )}
                    style={{ backgroundColor: colours.bg, color: colours.fg }}
                  >
                    <span className="flex items-center justify-between text-xs font-bold">
                      <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px] border-current">
                        {index + 1}
                      </span>
                      <span>≈ {roughDriveMinutes(item.km)} min drive</span>
                    </span>
                    <span className="flex flex-col gap-1.5">
                      <span style={{ lineHeight: 0.9 }} className="text-[clamp(34px,3.4vw,46px)] font-extrabold tracking-[-0.045em]">
                        {formatDistance(item.km)}
                      </span>
                      <span className="text-base leading-tight font-bold">{item.event.name}</span>
                      <span className="text-[13px] font-semibold opacity-80">
                        {shortWhen(item.event.nextOccurrenceAt || item.event.startsAt)} · {priceTag(item.event)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <p className={cn("rounded-[28px] border-[1.5px] border-border p-6 text-[15px] text-muted-foreground")}>
          Nothing within 25 km yet. Everything else is below.
        </p>
      )}
    </section>
  );
};

export default NearYou;
