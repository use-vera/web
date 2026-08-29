"use client";

import { LocationMap } from "@/components/location-map";
import {
  resolveTheme,
  type ResolvedTheme,
} from "@/components/page-blocks/theme";
import { cloudinaryVariant } from "@/lib/cloudinary";
import { formatNairaAmount } from "@/lib/format-currency";
import { googleMapsDirectionsUrl } from "@/lib/maps";
import { type PublicEventApi } from "@/lib/types/event";
import {
  type EventPageRatings,
  type EventPageResale,
  type PageBlock,
  type PageTheme,
} from "@/lib/types/event-page";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  ChevronDown,
  MapPin,
  Repeat2,
  Star,
  Ticket,
} from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import LogoMark from "../logo-mark";

/** One renderer for both the builder's preview and the published page. */
interface BlockContext {
  theme: ResolvedTheme;
  event: PublicEventApi;
  /* Off inside the builder, where a click selects rather than navigates. */
  interactive: boolean;
  /* Absent in the builder preview, where blocks fall back to a placeholder. */
  ratings?: EventPageRatings;
  resale?: EventPageResale;
}

const str = (props: Record<string, unknown>, key: string, fallback = "") =>
  typeof props[key] === "string" && props[key]
    ? (props[key] as string)
    : fallback;

const bool = (props: Record<string, unknown>, key: string, fallback = true) =>
  typeof props[key] === "boolean" ? (props[key] as boolean) : fallback;

const list = (props: Record<string, unknown>, key: string) =>
  Array.isArray(props[key]) ? (props[key] as Record<string, string>[]) : [];

/* Degrades to a missing line rather than a 500 on an unparseable date. */
const formatOccurrence = (value: string | null | undefined) => {
  if (!value) return null;

  const at = new Date(value);

  if (Number.isNaN(at.getTime())) return null;

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(at);
};

/** Content column. Backgrounds bleed full width; text stops here. */
const MEASURE = 1080;

const Section = ({
  children,
  theme,
  id,
  tone = "ground",
  flush = false,
  style,
}: {
  children: ReactNode;
  theme: ResolvedTheme;
  id?: string;
  /* `surface` lifts a section off the ground without needing a border. */
  tone?: "ground" | "surface";
  /* Reads as a continuation of the section above rather than a new band. */
  flush?: boolean;
  style?: CSSProperties;
}) => (
  <section
    id={id}
    style={{
      background: tone === "surface" ? theme.surface : theme.ground,
      padding: `${flush ? "0" : "clamp(22px, 4.5cqi, 56px)"} clamp(16px, 4.5cqi, 40px) clamp(22px, 4.5cqi, 56px)`,
      /* Anchored jumps land with the heading clear of the viewport edge. */
      scrollMarginTop: 12,
      ...style,
    }}
  >
    <div style={{ maxWidth: MEASURE, margin: "0 auto", width: "100%" }}>
      {children}
    </div>
  </section>
);

/** A real `h2`, not a styled div: this page is indexed and read aloud. */
const SectionHeading = ({
  children,
  theme,
  size = "eyebrow",
}: {
  children: string;
  theme: ResolvedTheme;
  size?: "eyebrow" | "title";
}) =>
  size === "title" ? (
    <h2
      style={{
        margin: 0,
        fontSize: "clamp(19px, 2.8cqi, 26px)",
        fontWeight: 800,
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </h2>
  ) : (
    <h2
      style={{
        margin: 0,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: theme.dim,
        textTransform: "uppercase",
      }}
    >
      {children}
    </h2>
  );

/** Checkout lives on the event page, which already handles Paystack. */
const buyHref = (event: PublicEventApi, tierId?: string) => {
  const base = `/events/${event._id}`;

  return tierId && tierId !== "base"
    ? `${base}?tier=${encodeURIComponent(tierId)}`
    : base;
};

const Hero = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const { theme, event } = ctx;
  const headline = str(block.props, "headline", event.name);
  const body = str(block.props, "body");
  const eyebrow = str(block.props, "eyebrow");
  const ctaLabel = str(block.props, "ctaLabel", "Get tickets");
  const rawImage = str(block.props, "imageUrl", event.imageUrl ?? "");
  const imageUrl = cloudinaryVariant(rawImage, "hero");
  const price = event.ticketPriceNaira || 0;
  const when = formatOccurrence(event.nextOccurrenceAt);

  /* Over a photo the theme's ink is unusable, so force light on dark. */
  const onPhoto = Boolean(imageUrl);
  const ink = onPhoto ? "#ffffff" : theme.ink;
  const dim = onPhoto ? "rgba(255,255,255,0.82)" : theme.dim;

  return (
    <section
      style={{
        position: "relative",
        color: ink,
        background: onPhoto
          ? `linear-gradient(180deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.40) 48%, rgba(0,0,0,0.74) 100%), url(${imageUrl}) center/cover no-repeat`
          : theme.surface,
        padding: "clamp(28px, 6cqi, 80px) clamp(16px, 4.5cqi, 40px)",
        minHeight: onPhoto ? "clamp(320px, 62cqi, 560px)" : undefined,
        display: "flex",
        /* A poster reads bottom-up; a plain hero reads top-down. */
        alignItems: onPhoto ? "flex-end" : "flex-start",
      }}
    >
      <div style={{ maxWidth: MEASURE, margin: "0 auto", width: "100%" }}>
        {eyebrow ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 999,
              background: onPhoto
                ? "rgba(255,255,255,0.16)"
                : `${theme.accent}22`,
              color: onPhoto ? "#ffffff" : theme.accent,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              backdropFilter: onPhoto ? "blur(6px)" : undefined,
            }}
          >
            {eyebrow}
          </span>
        ) : null}
        <h1
          style={{
            margin: eyebrow ? "18px 0 0" : 0,
            fontSize: "clamp(28px, 7cqi, 58px)",
            lineHeight: 1.03,
            letterSpacing: "-0.035em",
            fontWeight: 800,
            maxWidth: "18ch",
            textWrap: "balance",
          }}
        >
          {headline}
        </h1>
        {body ? (
          <p
            style={{
              margin: "14px 0 0",
              fontSize: "clamp(14.5px, 1.9cqi, 17px)",
              color: dim,
              maxWidth: "50ch",
              lineHeight: 1.6,
              textWrap: "pretty",
            }}
          >
            {body}
          </p>
        ) : null}

        {when || event.address ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px 22px",
              marginTop: 22,
              fontSize: 13.5,
              color: dim,
            }}
          >
            {when ? (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
              >
                <Calendar size={15} aria-hidden />
                {when}
              </span>
            ) : null}
            {event.address ? (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
              >
                <MapPin size={15} aria-hidden />
                {event.address}
              </span>
            ) : null}
          </div>
        ) : null}

        <a
          href={ctx.interactive ? "#tickets" : undefined}
          className="vera-cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            height: 50,
            padding: "0 26px",
            marginTop: 28,
            borderRadius: 999,
            background: theme.accent,
            color: theme.onAccent,
            fontSize: 14.5,
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          <Ticket size={16} aria-hidden />
          {ctaLabel}
          {price > 0 ? (
            <span style={{ opacity: 0.72, fontWeight: 600 }}>
              from {formatNairaAmount(price)}
            </span>
          ) : null}
        </a>
      </div>
    </section>
  );
};

const Text = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const heading = str(block.props, "heading");
  const body = str(block.props, "body");

  if (!heading && !body) {
    return null;
  }

  return (
    <Section theme={ctx.theme}>
      {heading ? (
        <SectionHeading theme={ctx.theme}>{heading}</SectionHeading>
      ) : null}
      <p
        style={{
          margin: heading ? "16px 0 0" : 0,
          fontSize: 16,
          lineHeight: 1.7,
          maxWidth: "68ch",
          opacity: 0.9,
          whiteSpace: "pre-line",
          textWrap: "pretty",
        }}
      >
        {body}
      </p>
    </Section>
  );
};

const Lineup = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const acts = list(block.props, "items");

  if (acts.length === 0) {
    return null;
  }

  return (
    <Section theme={ctx.theme} flush>
      <SectionHeading theme={ctx.theme}>
        {str(block.props, "heading", "Line-up")}
      </SectionHeading>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "22px 18px",
          marginTop: 18,
        }}
      >
        {acts.map((act, index) => {
          const photo = cloudinaryVariant(act.imageUrl, "square");

          return (
            <div key={`${act.name}-${index}`}>
              {photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photo}
                  alt={act.name ?? ""}
                  loading="lazy"
                  style={{
                    aspectRatio: "1",
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: 12,
                    display: "block",
                    background: ctx.theme.raised,
                  }}
                />
              ) : (
                <div
                  aria-hidden
                  style={{
                    aspectRatio: "1",
                    borderRadius: 12,
                    background: ctx.theme.raised,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 22,
                    fontWeight: 800,
                    color: ctx.theme.dim,
                  }}
                >
                  {(act.name ?? "?").trim().charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700 }}>
                {act.name}
              </div>
              {act.time ? (
                <div
                  style={{ fontSize: 12, color: ctx.theme.dim, marginTop: 3 }}
                >
                  {act.time}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Section>
  );
};

/** Bound: tiers, prices and availability come from the event, never the page. */
const Tickets = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const { theme, event } = ctx;
  const showSoldOut = bool(block.props, "showSoldOut");
  const showRemaining = bool(block.props, "showRemaining");
  const tiers = event.ticketCategories ?? [];

  const rows = tiers.length
    ? tiers
    : [
        {
          _id: "base",
          name: "General admission",
          priceNaira: event.ticketPriceNaira || 0,
          quantity: event.expectedTickets || 0,
          onSale: (event.remainingTickets ?? 0) > 0,
        } as (typeof tiers)[number],
      ];

  const visible = showSoldOut
    ? rows
    : rows.filter((tier) => tier.onSale !== false);

  return (
    <Section theme={theme} tone="surface" id="tickets">
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <SectionHeading theme={theme} size="title">
          {str(block.props, "heading", "Tickets")}
        </SectionHeading>
        {event.resale?.enabled ? (
          <span style={{ fontSize: 12, color: theme.dim }}>
            Resale allowed up to +{event.resale.maxMarkupPercent}%
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 18,
        }}
      >
        {visible.map((tier) => {
          const closed = tier.onSale === false;
          const label = closed
            ? tier.availabilityState === "upcoming"
              ? "Not on sale yet"
              : "No longer on sale"
            : showRemaining
              ? `${tier.quantity.toLocaleString("en-NG")} released`
              : "";

          return (
            <div
              key={tier._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 18px",
                borderRadius: 12,
                background: theme.ground,
                boxShadow: `inset 0 0 0 1px ${theme.line}`,
                opacity: closed ? 0.55 : 1,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>
                  {tier.name}
                </div>
                {label ? (
                  <div style={{ fontSize: 12, color: theme.dim, marginTop: 3 }}>
                    {label}
                  </div>
                ) : null}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                {tier.priceNaira > 0
                  ? formatNairaAmount(tier.priceNaira)
                  : "Free"}
              </div>

              {/* A closed tier has nowhere to go, and inside the builder a click
                  selects the block, only a live, open tier is a real link. */}
              {closed || !ctx.interactive ? (
                <span
                  style={{
                    height: 38,
                    padding: "0 18px",
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12.5,
                    fontWeight: 700,
                    background: closed ? "transparent" : theme.accent,
                    color: closed ? theme.dim : theme.onAccent,
                    boxShadow: closed
                      ? `inset 0 0 0 1px ${theme.line}`
                      : "none",
                  }}
                >
                  {closed ? "Closed" : "Get tickets"}
                </span>
              ) : (
                <a
                  href={buyHref(event, tier._id)}
                  className="vera-cta"
                  aria-label={`Get ${tier.name} tickets`}
                  style={{
                    height: 38,
                    padding: "0 18px",
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12.5,
                    fontWeight: 700,
                    background: theme.accent,
                    color: theme.onAccent,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Get tickets
                  <ArrowRight size={14} aria-hidden />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
};

/** Bound: address and coordinates come from the event. */
const Venue = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const { theme, event } = ctx;
  const directions = googleMapsDirectionsUrl({
    latitude: event.latitude,
    longitude: event.longitude,
    address: event.address,
  });
  const hasCoordinates =
    typeof event.latitude === "number" && typeof event.longitude === "number";
  const showMap = bool(block.props, "showMap") && hasCoordinates;

  return (
    <Section theme={theme}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: showMap
            ? "repeat(auto-fit, minmax(260px, 1fr))"
            : "1fr",
          gap: 28,
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <SectionHeading theme={theme}>
            {str(block.props, "heading", "Getting there")}
          </SectionHeading>
          <div style={{ marginTop: 12, fontSize: 18, fontWeight: 700 }}>
            {event.eventCenter?.name ?? event.address}
          </div>
          <div style={{ marginTop: 5, fontSize: 13.5, color: theme.dim }}>
            {event.eventCenter ? event.address : (event.state ?? "")}
          </div>
          {directions ? (
            <a
              href={ctx.interactive ? directions : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="vera-ghost"
              style={{
                marginTop: 16,
                height: 42,
                padding: "0 18px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: `inset 0 0 0 1px ${theme.line}`,
                fontSize: 13.5,
                fontWeight: 600,
                color: theme.ink,
                textDecoration: "none",
              }}
            >
              <MapPin size={15} aria-hidden />
              Open in Maps
            </a>
          ) : null}
        </div>

        {/* The real map, not a grey rectangle standing in for one. Same
            read-only component the event page uses. */}
        {showMap ? (
          <LocationMap
            latitude={event.latitude as number}
            longitude={event.longitude as number}
            radiusMeters={event.geofenceRadiusMeters ?? 150}
            interactive={false}
            className="h-[220px] w-full rounded-xl border-0"
          />
        ) : null}
      </div>
    </Section>
  );
};

const Faq = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const items = list(block.props, "items");

  if (items.length === 0) {
    return null;
  }

  return (
    <Section theme={ctx.theme} flush>
      <SectionHeading theme={ctx.theme}>
        {str(block.props, "heading", "Questions")}
      </SectionHeading>
      <div style={{ marginTop: 14, maxWidth: "72ch" }}>
        {items.map((item, index) => (
          <details
            key={`${item.question}-${index}`}
            style={{ borderBottom: `1px solid ${ctx.theme.line}` }}
          >
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                padding: "15px 0",
                fontSize: 14.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {item.question}
              <ChevronDown
                size={16}
                color={ctx.theme.dim}
                aria-hidden
                style={{ flexShrink: 0 }}
              />
            </summary>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: 14,
                lineHeight: 1.65,
                color: ctx.theme.dim,
                whiteSpace: "pre-line",
                textWrap: "pretty",
              }}
            >
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
};

const Sponsors = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const items = list(block.props, "items");

  if (items.length === 0) {
    return null;
  }

  return (
    <Section theme={ctx.theme} flush>
      <SectionHeading theme={ctx.theme}>
        {str(block.props, "heading", "With")}
      </SectionHeading>
      <div
        style={{
          display: "flex",
          gap: "22px 34px",
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: 18,
        }}
      >
        {items.map((item, index) => {
          const logo = cloudinaryVariant(item.imageUrl, "card");

          return logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={index}
              src={logo}
              alt={item.name ?? "Sponsor"}
              loading="lazy"
              /* Height-constrained so mixed logo shapes share one optical line. */
              style={{
                height: 34,
                width: "auto",
                maxWidth: 160,
                objectFit: "contain",
                opacity: 0.78,
              }}
            />
          ) : (
            <span
              key={index}
              style={{ fontSize: 15, fontWeight: 700, color: ctx.theme.dim }}
            >
              {item.name}
            </span>
          );
        })}
      </div>
    </Section>
  );
};


/** Client-only: reading the clock during render is impure and desyncs SSR. */
const useTimeUntil = (iso: string | null | undefined) => {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!iso) {
      return;
    }

    const target = new Date(iso).getTime();

    if (Number.isNaN(target)) {
      return;
    }

    const tick = () => setRemaining(target - Date.now());

    tick();
    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, [iso]);

  return remaining;
};

/** Builder-only. Stops an empty bound block rendering as an invisible strip. */
const Placeholder = ({
  theme,
  title,
  hint,
}: {
  theme: ResolvedTheme;
  title: string;
  hint: string;
}) => (
  <div
    style={{
      margin: "clamp(16px, 3.5cqi, 32px) clamp(16px, 4.5cqi, 40px)",
      padding: "20px 22px",
      borderRadius: 12,
      border: `1px dashed ${theme.line}`,
      color: theme.dim,
    }}
  >
    <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.ink }}>{title}</div>
    <p style={{ margin: "5px 0 0", fontSize: 12.5, lineHeight: 1.55 }}>{hint}</p>
  </div>
);

const Countdown = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const { theme, event } = ctx;
  const remaining = useTimeUntil(event.nextOccurrenceAt);
  const when = formatOccurrence(event.nextOccurrenceAt);

  if (!when) {
    return ctx.interactive ? null : (
      <Placeholder
        theme={theme}
        title="Countdown"
        hint="Waiting on a start date for this event."
      />
    );
  }

  const total = Math.max(0, remaining ?? 0);
  const parts = [
    { value: Math.floor(total / 86_400_000), label: "days" },
    { value: Math.floor(total / 3_600_000) % 24, label: "hours" },
    { value: Math.floor(total / 60_000) % 60, label: "mins" },
    { value: Math.floor(total / 1000) % 60, label: "secs" },
  ];

  const started = remaining !== null && remaining <= 0;

  return (
    <Section theme={theme} tone="surface">
      <SectionHeading theme={theme}>
        {started ? "Happening now" : str(block.props, "heading", "Doors open in")}
      </SectionHeading>

      {started ? (
        <div style={{ marginTop: 12, fontSize: "clamp(22px, 4cqi, 34px)", fontWeight: 800 }}>
          It has started
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          {parts.map((part) => (
            <div
              key={part.label}
              style={{
                minWidth: 78,
                padding: "14px 16px",
                borderRadius: 12,
                background: theme.ground,
                boxShadow: `inset 0 0 0 1px ${theme.line}`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(21px, 4cqi, 32px)",
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.03em",
                  /* "00" before the clock starts would be a confident lie. */
                  opacity: remaining === null ? 0.25 : 1,
                }}
              >
                {remaining === null ? "––" : String(part.value).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: theme.dim,
                  marginTop: 4,
                }}
              >
                {part.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {bool(block.props, "showDate") ? (
        <div style={{ marginTop: 14, fontSize: 13.5, color: theme.dim }}>{when}</div>
      ) : null}
    </Section>
  );
};

/** Bound: reads the same sold count the checkout decrements. */
const Progress = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const { theme, event } = ctx;
  const sold = Math.max(0, event.soldTickets ?? 0);
  const capacity = Math.max(0, event.expectedTickets ?? 0);

  /* No capacity means no fraction to draw. */
  if (capacity <= 0) {
    return ctx.interactive ? null : (
      <Placeholder
        theme={theme}
        title="Tickets sold"
        hint="Set how many tickets exist on the event and this fills in."
      />
    );
  }

  const percent = Math.min(100, Math.round((sold / capacity) * 100));
  const remaining = Math.max(0, capacity - sold);
  const soldOut = remaining === 0;

  return (
    <Section theme={theme}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <SectionHeading theme={theme}>
          {soldOut ? "Sold out" : str(block.props, "heading", "Selling now")}
        </SectionHeading>
        {bool(block.props, "showCount") ? (
          <span
            style={{ fontSize: 13, color: theme.dim, fontVariantNumeric: "tabular-nums" }}
          >
            {soldOut
              ? `All ${capacity.toLocaleString("en-NG")} gone`
              : `${sold.toLocaleString("en-NG")} of ${capacity.toLocaleString("en-NG")} gone`}
          </span>
        ) : null}
      </div>

      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percent}% of tickets sold`}
        style={{
          marginTop: 14,
          height: 10,
          borderRadius: 999,
          background: theme.raised,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: 999,
            background: theme.accent,
            transition: "width .4s ease",
          }}
        />
      </div>

      {!soldOut && remaining <= Math.max(10, capacity * 0.1) ? (
        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: theme.accent }}>
          {remaining.toLocaleString("en-NG")} left
        </div>
      ) : null}
    </Section>
  );
};

/** A banner that reads the event's own sale window rather than a typed date. */
const Phase = ({ ctx }: { ctx: BlockContext }) => {
  const { theme, event } = ctx;
  const phase = event.salePhase;
  const presaleStarts = formatOccurrence(event.sales?.presaleStartsAt);
  const salesStart = formatOccurrence(event.sales?.startsAt);

  const notice =
    phase === "presale"
      ? { title: "Presale is live", body: "Presale prices hold until the main sale opens." }
      : phase === "upcoming"
        ? {
            title: "Not on sale yet",
            body: presaleStarts
              ? `Presale opens ${presaleStarts}.`
              : salesStart
                ? `Tickets go on sale ${salesStart}.`
                : "Tickets go on sale soon.",
          }
        : null;

  /* The tickets block already says this during the main sale. */
  if (!notice) {
    return ctx.interactive ? null : (
      <Placeholder
        theme={theme}
        title="Sale notice"
        hint="Shows automatically before tickets open and during presale. Your main sale is running, so visitors see nothing here."
      />
    );
  }

  return (
    <Section theme={theme} flush>
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          padding: "16px 18px",
          borderRadius: 12,
          background: `${theme.accent}1a`,
          boxShadow: `inset 0 0 0 1px ${theme.accent}40`,
        }}
      >
        <Ticket size={18} color={theme.accent} aria-hidden style={{ marginTop: 1, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>{notice.title}</div>
          <div style={{ marginTop: 3, fontSize: 13.5, color: theme.dim, lineHeight: 1.55 }}>
            {notice.body}
          </div>
        </div>
      </div>
    </Section>
  );
};

/** Bound: who is taking the money, and whether Vera has verified them. */
const Organizer = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const { theme, event } = ctx;
  const organizer =
    typeof event.organizerUserId === "object" ? event.organizerUserId : null;

  if (!organizer) {
    return ctx.interactive ? null : (
      <Placeholder
        theme={theme}
        title="Organizer"
        hint="Your name, photo and verification appear here on the published page."
      />
    );
  }

  const avatar = cloudinaryVariant(organizer.avatarUrl, "thumb");
  const verified = event.organizerBadge?.verified;
  const tier = event.organizerBadge?.tier;
  const body = str(block.props, "body");

  return (
    <Section theme={theme}>
      <SectionHeading theme={theme}>
        {str(block.props, "heading", "Presented by")}
      </SectionHeading>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginTop: 16,
          flexWrap: "wrap",
        }}
      >
        {avatar ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatar}
            alt=""
            loading="lazy"
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              objectFit: "cover",
              flexShrink: 0,
              background: theme.raised,
            }}
          />
        ) : (
          <div
            aria-hidden
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: theme.raised,
              display: "grid",
              placeItems: "center",
              fontSize: 20,
              fontWeight: 800,
              color: theme.dim,
              flexShrink: 0,
            }}
          >
            {organizer.fullName?.trim().charAt(0).toUpperCase() ?? "?"}
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{organizer.fullName}</span>
            {verified ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: `${theme.accent}22`,
                  color: theme.accent,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <BadgeCheck size={12} aria-hidden />
                {tier === "elite" ? "Elite organizer" : "Verified"}
              </span>
            ) : null}
          </div>
          {organizer.title ? (
            <div style={{ marginTop: 3, fontSize: 13.5, color: theme.dim }}>
              {organizer.title}
            </div>
          ) : null}
        </div>
      </div>

      {body ? (
        <p
          style={{
            margin: "16px 0 0",
            fontSize: 15,
            lineHeight: 1.65,
            maxWidth: "62ch",
            opacity: 0.88,
            whiteSpace: "pre-line",
          }}
        >
          {body}
        </p>
      ) : null}
    </Section>
  );
};

const Stars = ({ value, theme }: { value: number; theme: ResolvedTheme }) => (
  <span style={{ display: "inline-flex", gap: 2 }} aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((step) => (
      <Star
        key={step}
        size={14}
        aria-hidden
        fill={step <= Math.round(value) ? theme.accent : "transparent"}
        color={step <= Math.round(value) ? theme.accent : theme.line}
      />
    ))}
  </span>
);

/** Bound: ratings left on past editions of a recurring event. */
const Reviews = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const { theme, event, ratings } = ctx;
  const count = ratings?.ratingsCount ?? event.ratingsCount ?? 0;
  const average = ratings?.averageRating ?? event.averageRating ?? 0;

  /* Empty stars would read as a bad score. */
  if (count === 0) {
    return ctx.interactive ? null : (
      <Placeholder
        theme={theme}
        title="Reviews"
        hint="Appears once people have rated this event. Nobody has yet, so visitors see nothing here."
      />
    );
  }

  const limit = Math.max(1, Math.min(6, Number(block.props.limit) || 3));
  const written = (ratings?.items ?? [])
    .filter((item) => item.review?.trim())
    .slice(0, limit);

  return (
    <Section theme={theme} tone="surface">
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <SectionHeading theme={theme}>
          {str(block.props, "heading", "What people said")}
        </SectionHeading>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: theme.dim,
          }}
        >
          <Stars value={average} theme={theme} />
          {average.toFixed(1)} · {count.toLocaleString("en-NG")}{" "}
          {count === 1 ? "rating" : "ratings"}
        </span>
      </div>

      {written.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            marginTop: 18,
          }}
        >
          {written.map((item) => {
            const author =
              typeof item.userId === "object" && item.userId ? item.userId.fullName : null;

            return (
              <figure
                key={item._id}
                style={{
                  margin: 0,
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: theme.ground,
                  boxShadow: `inset 0 0 0 1px ${theme.line}`,
                }}
              >
                <Stars value={item.rating} theme={theme} />
                <blockquote
                  style={{
                    margin: "10px 0 0",
                    fontSize: 14,
                    lineHeight: 1.6,
                    textWrap: "pretty",
                  }}
                >
                  {item.review}
                </blockquote>
                {author ? (
                  <figcaption style={{ marginTop: 10, fontSize: 12.5, color: theme.dim }}>
                    {author}
                  </figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      ) : null}
    </Section>
  );
};

/** Bound: the live, price-capped resale marketplace. */
const Resale = ({ block, ctx }: { block: PageBlock; ctx: BlockContext }) => {
  const { theme, event, resale, interactive } = ctx;
  const policy = event.resale;

  if (!policy?.enabled) {
    return ctx.interactive ? null : (
      <Placeholder
        theme={theme}
        title="Resale"
        hint="Turn resale on in the event's settings and this shows the live marketplace."
      />
    );
  }

  const listings = resale?.listingCount ?? 0;
  const from = resale?.fromPriceNaira ?? null;

  return (
    <Section theme={theme}>
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          padding: "22px 24px",
          borderRadius: 14,
          background: theme.surface,
          boxShadow: `inset 0 0 0 1px ${theme.line}`,
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 260px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Repeat2 size={18} color={theme.accent} aria-hidden />
            <SectionHeading theme={theme} size="title">
              {str(block.props, "heading", "Sold out? Try resale")}
            </SectionHeading>
          </div>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 14,
              lineHeight: 1.6,
              color: theme.dim,
              maxWidth: "52ch",
            }}
          >
            {listings > 0
              ? `${listings.toLocaleString("en-NG")} ${listings === 1 ? "ticket" : "tickets"} listed by people who can no longer make it${
                  from ? `, from ${formatNairaAmount(from)}` : ""
                }. `
              : "No tickets listed right now. "}
            Every resale is capped at +{policy.maxMarkupPercent}% of face value and
            the ticket only transfers once payment clears.
          </p>
        </div>

        {interactive ? (
          <a
            href={`/events/${event._id}`}
            className="vera-cta"
            style={{
              height: 44,
              padding: "0 22px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: listings > 0 ? theme.accent : "transparent",
              color: listings > 0 ? theme.onAccent : theme.ink,
              boxShadow: listings > 0 ? "none" : `inset 0 0 0 1px ${theme.line}`,
              fontSize: 13.5,
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {listings > 0 ? "See resale tickets" : "Watch for resale"}
            <ArrowRight size={15} aria-hidden />
          </a>
        ) : null}
      </div>
    </Section>
  );
};

/** Vera-owned. Carries the terms a ticket buyer is entitled to find. */
const Footer = ({ ctx }: { ctx: BlockContext }) => {
  const { theme, event, interactive } = ctx;

  /* Only routes that exist. There is no terms or report page to link yet. */
  const links: [string, string][] = [
    ["Event details", `/events/${event._id}`],
    ["How Vera works", "/how-it-works"],
  ];

  return (
    <footer
      style={{
        background: theme.surface,
        borderTop: `1px solid ${theme.line}`,
        padding: "clamp(18px, 3cqi, 26px) clamp(16px, 4.5cqi, 40px) clamp(22px, 3.5cqi, 32px)",
      }}
    >
      <div
        style={{
          maxWidth: MEASURE,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <nav
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            fontSize: 12,
            color: theme.dim,
          }}
        >
          {links.map(([label, href]) => (
            <a
              key={label}
              href={interactive ? href : undefined}
              className="vera-footer-link"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {label}
            </a>
          ))}
        </nav>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12,
            color: theme.dim,
          }}
        >
          Tickets by
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 700,
              color: theme.ink,
            }}
          >
            {/* <span
              aria-hidden
              style={{
                width: 16,
                height: 16,
                borderRadius: 5,
                background: "#0fb26e",
                color: "#16150f",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9.5,
                fontWeight: 800,
              }}
            >
              V
            </span> */}
            <LogoMark className="size-4" />
            Vera
          </span>
        </div>
      </div>
    </footer>
  );
};

export const PageBlockView = ({
  block,
  event,
  theme,
  interactive = true,
  ratings,
  resale,
}: {
  block: PageBlock;
  event: PublicEventApi;
  theme?: PageTheme;
  interactive?: boolean;
  ratings?: EventPageRatings;
  resale?: EventPageResale;
}) => {
  const ctx: BlockContext = {
    theme: resolveTheme(theme),
    event,
    interactive,
    ratings,
    resale,
  };

  switch (block.type) {
    case "hero":
      return <Hero block={block} ctx={ctx} />;
    case "text":
      return <Text block={block} ctx={ctx} />;
    case "lineup":
      return <Lineup block={block} ctx={ctx} />;
    case "tickets":
      return <Tickets block={block} ctx={ctx} />;
    case "venue":
      return <Venue block={block} ctx={ctx} />;
    case "faq":
      return <Faq block={block} ctx={ctx} />;
    case "sponsors":
      return <Sponsors block={block} ctx={ctx} />;
    case "countdown":
      return <Countdown block={block} ctx={ctx} />;
    case "progress":
      return <Progress block={block} ctx={ctx} />;
    case "phase":
      return <Phase ctx={ctx} />;
    case "organizer":
      return <Organizer block={block} ctx={ctx} />;
    case "reviews":
      return <Reviews block={block} ctx={ctx} />;
    case "resale":
      return <Resale block={block} ctx={ctx} />;
    case "footer":
      return <Footer ctx={ctx} />;
    default:
      /* Pages outlive deploys, so an unknown block is skipped, not fatal. */
      return null;
  }
};

/** What inline styles cannot express. Scoped so it cannot reach the builder. */
const PAGE_CSS = `
.vera-page {
  /* Scales off this box, not the viewport, so the 390px preview is honest. */
  container-type: inline-size;
}
.vera-page h1,
.vera-page h2,
.vera-page .vera-display { font-family: var(--page-display); }
.vera-page a { -webkit-tap-highlight-color: transparent; }
.vera-page a:focus-visible,
.vera-page summary:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
  border-radius: 6px;
}
.vera-page .vera-cta { transition: transform .16s ease, filter .16s ease; }
.vera-page .vera-cta:hover { filter: brightness(1.06); }
.vera-page .vera-cta:active { transform: scale(.98); }
.vera-page .vera-ghost { transition: background-color .16s ease; }
.vera-page .vera-ghost:hover { background: rgba(128,128,128,.12); }
.vera-page .vera-footer-link { transition: opacity .16s ease; }
.vera-page .vera-footer-link:hover { opacity: .65; text-decoration: underline; }
.vera-page summary { list-style: none; }
.vera-page summary::-webkit-details-marker { display: none; }
.vera-page details[open] > summary svg { transform: rotate(180deg); }
.vera-page summary svg { transition: transform .18s ease; }
.vera-page img { max-width: 100%; }
@media (prefers-reduced-motion: reduce) {
  .vera-page *, .vera-page *::before, .vera-page *::after {
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}
`;

export const PageBlocks = ({
  blocks,
  event,
  theme,
  interactive = true,
  ratings,
  resale,
}: {
  blocks: PageBlock[];
  event: PublicEventApi;
  theme?: PageTheme;
  interactive?: boolean;
  ratings?: EventPageRatings;
  resale?: EventPageResale;
}) => {
  const resolved = resolveTheme(theme);

  return (
    <div
      className="vera-page"
      style={
        {
          background: resolved.ground,
          color: resolved.ink,
          fontFamily: resolved.fontStack,
          "--page-display": resolved.displayStack,
        } as CSSProperties
      }
    >
      <style>{PAGE_CSS}</style>
      {blocks.map((block) => (
        <PageBlockView
          key={block.id}
          block={block}
          event={event}
          theme={theme}
          interactive={interactive}
          ratings={ratings}
          resale={resale}
        />
      ))}
    </div>
  );
};
