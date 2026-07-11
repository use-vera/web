"use client";

import EventCardCompact from "@/components/event-card-compact";
import EventDetailModal from "@/components/event-detail-modal";
import Button from "@/components/ui/button";
import { useEvents } from "@/lib/hooks/use-events";
import { type EventListQuery, type PublicEventApi } from "@/lib/types/event";
import { Loader2, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";

type LocationState =
  | { status: "pending" }
  | { status: "granted"; latitude: number; longitude: number }
  | { status: "denied" };

interface NearMeResultsProps {
  latitude: number;
  longitude: number;
}

const NearMeResults = ({ latitude, longitude }: NearMeResultsProps) => {
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<PublicEventApi | null>(
    null,
  );

  const query = useMemo<EventListQuery>(
    () => ({
      search,
      filter: "upcoming",
      nearLat: latitude,
      nearLng: longitude,
      nearRadiusKm: 25,
      limit: 30,
    }),
    [search, latitude, longitude],
  );

  const eventsQuery = useEvents(query);
  const events = eventsQuery.data?.items ?? [];

  return (
    <>
      <div className="relative mt-8 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search events near you"
          type="search"
          className="h-12 w-full rounded-md border border-border bg-background pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      <div className="mt-8">
        {eventsQuery.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length ? (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              {events.length} upcoming event{events.length === 1 ? "" : "s"}{" "}
              within 25km
            </p>
            <div className="flex flex-col gap-3">
              {events.map((event) => (
                <EventCardCompact
                  key={event._id}
                  event={event}
                  onSelect={setSelectedEvent}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-card px-8 py-16 text-center">
            <p className="text-base font-semibold text-card-foreground">
              Nothing upcoming within 25km right now.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different keyword, or check back later.
            </p>
          </div>
        )}
      </div>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
};

export default function NearMePage() {
  const [location, setLocation] = useState<LocationState>({
    status: "pending",
  });

  const requestLocation = () => {
    setLocation({ status: "pending" });

    if (!navigator.geolocation) {
      setLocation({ status: "denied" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          status: "granted",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setLocation({ status: "denied" });
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Events near me
          </span>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            What&apos;s happening around you.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Share your location and we&apos;ll show you events within 25km.
          </p>
        </div>

        {location.status === "pending" ? (
          <NearMeLocationPrompt onRequest={requestLocation} />
        ) : location.status === "denied" ? (
          <NearMeLocationDenied onRetry={requestLocation} />
        ) : (
          <NearMeResults
            latitude={location.latitude}
            longitude={location.longitude}
          />
        )}
      </section>
    </main>
  );
}

const NearMeLocationPrompt = ({ onRequest }: { onRequest: () => void }) => (
  <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-8 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
      <MapPin className="h-6 w-6 text-primary" />
    </div>
    <p className="text-base font-semibold text-card-foreground">
      Enable location to see events near you
    </p>
    <p className="max-w-sm text-sm text-muted-foreground">
      We only use this to find events within 25km — nothing is stored beyond
      this page.
    </p>
    <Button size="lg" className="mt-2" onClick={onRequest}>
      Share my location
    </Button>
  </div>
);

const NearMeLocationDenied = ({ onRetry }: { onRetry: () => void }) => (
  <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-8 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
      <MapPin className="h-6 w-6 text-primary" />
    </div>
    <p className="text-base font-semibold text-card-foreground">
      We couldn&apos;t get your location
    </p>
    <p className="max-w-sm text-sm text-muted-foreground">
      Check your browser&apos;s location permission for this site, then try
      again.
    </p>
    <Button size="lg" className="mt-2" onClick={onRetry}>
      Try again
    </Button>
  </div>
);
