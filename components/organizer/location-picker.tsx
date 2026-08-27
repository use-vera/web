"use client";

import { LocationMap } from "@/components/location-map";
import { OrganizerField } from "@/components/organizer/organizer-field";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import {
  useEventCenterSearch,
  useGeocodeSearch,
  useReverseGeocode,
} from "@/lib/hooks/use-organizer";
import { cn } from "@/lib/utils";
import { Check, Crosshair, Loader2, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface EventLocation {
  address: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  eventCenterId?: string;
  geofenceRadiusMeters: number;
}

/** Lagos — the same fallback centre the mobile map uses. */
export const DEFAULT_LOCATION: EventLocation = {
  address: "",
  state: "",
  country: "Nigeria",
  latitude: 6.4549,
  longitude: 3.3947,
  geofenceRadiusMeters: 150,
};

const RADII = [50, 150, 500, 1000];

export const LocationPicker = ({
  value,
  onChange,
}: {
  value: EventLocation;
  onChange: (next: EventLocation) => void;
}) => {
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 350);

  const centersQuery = useEventCenterSearch(debouncedQuery, {
    latitude: value.latitude,
    longitude: value.longitude,
  });
  const placesQuery = useGeocodeSearch(debouncedQuery);
  const reverse = useReverseGeocode();

  const venues = centersQuery.data?.items ?? [];
  const places = placesQuery.data ?? [];
  const searching = centersQuery.isFetching || placesQuery.isFetching;
  const hasResults = venues.length > 0 || places.length > 0;

  const pickCoordinates = async (latitude: number, longitude: number) => {
    onChange({ ...value, latitude, longitude, eventCenterId: undefined });

    try {
      const place = await reverse.mutateAsync({ latitude, longitude });

      if (place) {
        onChange({
          ...value,
          latitude,
          longitude,
          eventCenterId: undefined,
          address: value.address || place.name,
          state: place.state || value.state,
          country: place.country || value.country,
        });
      }
    } catch {
      /* The pin still moved; only the address lookup failed. */
    }
  };

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("This browser can't share your location");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await pickCoordinates(
          position.coords.latitude,
          position.coords.longitude,
        );
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was declined. Search for the venue instead."
            : "Couldn't read your location. Search for the venue instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="mb-2 block text-[13px] font-semibold">
          Find the venue
        </span>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <OrganizerField
              value={query}
              onChange={(input) => setQuery(input.target.value)}
              placeholder="Search a venue or address"
              aria-label="Search for a venue or address"
              className="pl-10"
            />
            {searching ? (
              <Loader2 className="absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-12 shrink-0"
            onClick={useMyLocation}
            loading={locating}
          >
            <Crosshair className="h-4 w-4" />
            Use my location
          </Button>
        </div>

        {debouncedQuery.length >= 2 && hasResults ? (
          <div className="mt-2 overflow-hidden rounded-md border border-border bg-card">
            {venues.map((venue) => (
              <button
                key={venue._id}
                type="button"
                onClick={() => {
                  onChange({
                    ...value,
                    address: venue.name,
                    latitude: venue.latitude,
                    longitude: venue.longitude,
                    eventCenterId: venue._id,
                  });
                  setQuery("");
                }}
                className="flex w-full cursor-pointer items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/60"
              >
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">
                    {venue.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Known venue
                    {venue.usageCount
                      ? ` · ${venue.usageCount} events held here`
                      : ""}
                  </span>
                </span>
                {venue.verified ? <Badge>Verified</Badge> : null}
              </button>
            ))}
            {places.map((place) => (
              <button
                key={`${place.latitude},${place.longitude}`}
                type="button"
                onClick={() => {
                  onChange({
                    ...value,
                    address: place.name,
                    state: place.state || value.state,
                    country: place.country || value.country,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    eventCenterId: undefined,
                  });
                  setQuery("");
                }}
                className="flex w-full cursor-pointer items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/60"
              >
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">
                    {place.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {place.label}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[13px] font-semibold">Drop the pin</span>
          <span className="text-xs text-muted-foreground">
            Click the map or drag the pin
          </span>
        </div>
        <LocationMap
          latitude={value.latitude}
          longitude={value.longitude}
          radiusMeters={value.geofenceRadiusMeters}
          onChange={({ latitude, longitude }) =>
            void pickCoordinates(latitude, longitude)
          }
        />
        <p className="mt-2 text-xs text-muted-foreground tabular-nums">
          {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
          {reverse.isPending ? " · looking up address…" : ""}
        </p>
      </div>

      <div>
        <span className="mb-2 block text-[13px] font-semibold">
          Check-in radius
        </span>
        <div className="inline-flex gap-1 rounded-full bg-muted p-1">
          {RADII.map((radius) => (
            <button
              key={radius}
              type="button"
              onClick={() =>
                onChange({ ...value, geofenceRadiusMeters: radius })
              }
              className={cn(
                "inline-flex h-8 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                value.geofenceRadiusMeters === radius
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          How close someone has to be for their ticket to scan at the door.
        </p>
      </div>

      {value.eventCenterId ? (
        <p className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Check className="h-3.5 w-3.5" />
          Linked to a venue Vera already knows.
        </p>
      ) : null}
    </div>
  );
};
