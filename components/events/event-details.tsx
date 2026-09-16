"use client";

import { LocationMap } from "@/components/location-map";
import Badge from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatNairaAmount } from "@/lib/format-currency";
import { googleMapsDirectionsUrl } from "@/lib/maps";
import {
  type CategoryApi,
  type EventRatingApi,
  type PublicEventApi,
} from "@/lib/types/event";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  MapPin,
  Navigation,
  Repeat,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import { type ReactNode } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Section = ({
  title,
  children,
  aside,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) => (
  <section className="pt-7 first:pt-0">
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {aside}
    </div>
    {children}
  </section>
);

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

const raterOf = (rating: EventRatingApi) =>
  typeof rating.userId === "string" ? "Attendee" : rating.userId.fullName;

const categoryName = (category: string | CategoryApi) =>
  typeof category === "string" ? null : category.name;

const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const time = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));

export const EventDetails = ({
  event,
  ratings,
}: {
  event: PublicEventApi;
  ratings: { averageRating: number; ratingsCount: number; items: EventRatingApi[] };
}) => {
  const organizer =
    typeof event.organizerUserId === "string" ? null : event.organizerUserId;
  const venue = event.eventCenter ?? null;
  const categories = (event.categoryIds ?? [])
    .map(categoryName)
    .filter((name): name is string => Boolean(name));
  const tiers = event.ticketCategories ?? [];
  const hasCoordinates =
    typeof event.latitude === "number" && typeof event.longitude === "number";
  const reviews = ratings.items.filter((item) => item.review);
  const repeats = event.recurrence && event.recurrence.type !== "none";
  const capacity = event.expectedTickets || 0;
  const sold = event.soldTickets || 0;
  const presale = event.sales?.presaleEnabled ? event.sales : null;
  const directionsUrl = googleMapsDirectionsUrl({
    latitude: event.latitude,
    longitude: event.longitude,
    address: event.address,
  });

  return (
    <div className="divide-y divide-border">
      <Section title="About this event">
        <p className="text-[15px] leading-relaxed text-pretty">
          {event.description || "The organizer hasn't written a description yet."}
        </p>
        {categories.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((name) => (
              <Badge key={name} variant="outline">
                {name}
              </Badge>
            ))}
          </div>
        ) : null}
      </Section>

      <Section
        title="When"
        aside={
          repeats ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Repeat className="h-3.5 w-3.5" />
              {event.recurrence?.type === "weekly" &&
              event.recurrence.daysOfWeek?.length
                ? `Every ${event.recurrence.daysOfWeek
                    .map((day) => WEEKDAYS[day])
                    .join(", ")}`
                : "Repeats"}
            </span>
          ) : null
        }
      >
        <Card className="gap-0 py-0">
          <div className="flex items-center gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <CalendarDays className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold">
                {longDate(event.nextOccurrenceAt)}
              </div>
              <div className="mt-0.5 text-[13px] text-muted-foreground">
                {time(event.nextOccurrenceAt)} to {time(event.nextOccurrenceEndsAt)}
                {event.timezone ? ` · ${event.timezone}` : ""}
              </div>
            </div>
          </div>
          {presale ? (
            <>
              <hr className="ticket-perforation" />
              <div className="flex items-center gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Clock className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Presale</div>
                  <div className="mt-0.5 text-[13px] text-muted-foreground tabular-nums">
                    {presale.presaleQuantity
                      ? `${presale.presaleQuantity.toLocaleString("en-NG")} tickets`
                      : "Limited batch"}
                    {presale.presalePriceNaira
                      ? ` at ${formatNairaAmount(presale.presalePriceNaira)}`
                      : ""}
                    {presale.presaleEndsAt
                      ? ` · closes ${longDate(presale.presaleEndsAt)}`
                      : ""}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </Card>
      </Section>

      <Section
        title="Where"
        aside={
          venue?.verified ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-foreground">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified venue
            </span>
          ) : null
        }
      >
        <Card className="gap-0 overflow-hidden py-0">
          <div className="flex flex-wrap items-start gap-4 px-4 py-4 sm:flex-nowrap sm:px-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <MapPin className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold">
                {venue?.name ?? event.address}
              </div>
              <div className="mt-0.5 text-[13px] text-muted-foreground">
                {venue ? event.address : event.state || "Nigeria"}
              </div>
              {venue?.successfulEventsCount ? (
                <div className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                  {venue.successfulEventsCount} events have run here
                </div>
              ) : null}
            </div>
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition-colors hover:bg-secondary sm:ml-auto sm:h-10"
              >
                <Navigation className="h-4 w-4" />
                Open in Maps
              </a>
            ) : null}
          </div>
          {hasCoordinates ? (
            <LocationMap
              latitude={event.latitude as number}
              longitude={event.longitude as number}
              radiusMeters={event.geofenceRadiusMeters ?? 150}
              interactive={false}
              className="h-[220px] rounded-none border-0 border-t border-border"
            />
          ) : null}
        </Card>
      </Section>

      {tiers.length > 0 ? (
        <Section
          title="Tickets"
          aside={
            <span className="text-xs text-muted-foreground tabular-nums">
              {sold.toLocaleString("en-NG")} of{" "}
              {capacity.toLocaleString("en-NG")} sold
            </span>
          }
        >
          <Card className="gap-0 py-0">
            {tiers.map((tier, index) => (
              <div key={tier._id ?? tier.name}>
                {index > 0 ? <hr className="ticket-perforation" /> : null}
                <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Ticket className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {tier.name}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {tier.availableFrom || tier.availableUntil
                          ? [
                              tier.availableFrom
                                ? `from ${new Intl.DateTimeFormat("en-NG", {
                                    day: "numeric",
                                    month: "short",
                                  }).format(new Date(tier.availableFrom))}`
                                : null,
                              tier.availableUntil
                                ? `until ${new Intl.DateTimeFormat("en-NG", {
                                    day: "numeric",
                                    month: "short",
                                  }).format(new Date(tier.availableUntil))}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" ")
                          : `${tier.quantity.toLocaleString("en-NG")} released`}
                      </div>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    {tier.onSale === false ? (
                      <Badge variant="outline">
                        {tier.availabilityState === "upcoming"
                          ? "Not yet"
                          : "Closed"}
                      </Badge>
                    ) : null}
                    <span className="text-sm font-semibold tabular-nums">
                      {tier.priceNaira > 0
                        ? formatNairaAmount(tier.priceNaira)
                        : "Free"}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </Section>
      ) : null}

      {organizer ? (
        <Section title="Organizer">
          <Card className="flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-muted-foreground outline outline-foreground/10 -outline-offset-1">
              {organizer.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={organizer.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(organizer.fullName)
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold">
                  {organizer.fullName}
                </span>
                {event.organizerBadge?.verified ? (
                  <Badge>
                    <BadgeCheck className="h-3 w-3" />
                    {event.organizerBadge.tier === "elite"
                      ? "Elite organizer"
                      : "Verified"}
                  </Badge>
                ) : null}
              </div>
              {organizer.title ? (
                <div className="mt-0.5 truncate text-[13px] text-muted-foreground">
                  {organizer.title}
                </div>
              ) : null}
            </div>
            {event.friendsGoingCount ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                <Users className="h-3.5 w-3.5" />
                {event.friendsGoingCount} you follow going
              </span>
            ) : null}
          </Card>
        </Section>
      ) : null}

      <Section
        title="Reviews"
        aside={
          ratings.ratingsCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              {ratings.averageRating.toFixed(1)}
              <span className="font-medium text-muted-foreground">
                · {ratings.ratingsCount.toLocaleString("en-NG")}
              </span>
            </span>
          ) : null
        }
      >
        {reviews.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            {ratings.ratingsCount > 0
              ? "Attendees rated this event but haven't written anything yet."
              : "No reviews yet. Attendees are asked the morning after."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.slice(0, 4).map((rating) => (
              <Card key={rating._id} className="flex-row gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {initials(raterOf(rating))}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">
                      {raterOf(rating)}
                    </span>
                    <span className="inline-flex gap-px">
                      {Array.from({ length: Math.round(rating.rating) }).map(
                        (_, index) => (
                          <Star
                            key={index}
                            className={cn(
                              "h-[11px] w-[11px] fill-primary text-primary",
                            )}
                          />
                        ),
                      )}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-pretty text-muted-foreground">
                    {rating.review}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};
