import { type EventRatingApi, type PublicEventApi } from "@/lib/types/event";

export type BlockType =
  | "hero"
  | "text"
  | "lineup"
  | "gallery"
  | "video"
  | "faq"
  | "sponsors"
  | "tickets"
  | "venue"
  | "countdown"
  | "organizer"
  | "reviews"
  | "resale"
  | "progress"
  | "phase"
  | "footer";

/**
 * Blocks that read the event record instead of carrying their own content.
 * Their props are presentation only. Move a venue and every page follows.
 */
export const BOUND_BLOCKS: BlockType[] = [
  "tickets",
  "venue",
  "countdown",
  "organizer",
  "reviews",
  "resale",
  "progress",
  "phase",
];

export const isBoundBlock = (type: BlockType) => BOUND_BLOCKS.includes(type);

/** Sections a page cannot ship without: one sells, one carries the terms. */
export const LOCKED_BLOCKS: BlockType[] = ["tickets", "footer"];

export const isLockedBlock = (type: BlockType) => LOCKED_BLOCKS.includes(type);

export interface PageBlock {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
}

export type ThemePreset =
  | "paper"
  | "midnight"
  | "ink"
  | "sun"
  | "noir"
  | "forest"
  | "plum"
  | "ocean"
  | "bloom"
  | "slate"
  | "sand"
  | "mint";

export type ThemeFont =
  | "gilroy"
  | "editorial"
  | "poster"
  | "brutal"
  | "soft"
  | "club"
  | "modern"
  | "classic"
  | "condensed"
  | "quirky"
  | "statement"
  | "humanist";

export interface PageTheme {
  preset: ThemePreset;
  accent?: string;
  font?: ThemeFont;
}

export interface PageSeo {
  title?: string;
  description?: string;
  imageUrl?: string;
  indexable?: boolean;
}

export interface EventPageApi {
  _id: string;
  eventId: string;
  slug: string;
  previousSlugs: string[];
  theme: PageTheme;
  blocks: PageBlock[];
  status: "draft" | "published";
  seo: PageSeo;
  publishedAt: string | null;
  updatedAt: string;
}

export interface EventPageEditorState {
  page: EventPageApi | null;
  suggestedSlug: string;
  /** Present only before a page exists. A first draft that already reads. */
  starterBlocks: PageBlock[] | null;
}

/** What the reviews block draws on. The aggregate plus what people wrote. */
export interface EventPageRatings {
  averageRating: number;
  ratingsCount: number;
  items: EventRatingApi[];
}

/** Live marketplace state, so the resale block never invents a number. */
export interface EventPageResale {
  enabled: boolean;
  listingCount: number;
  fromPriceNaira: number | null;
}

export interface PublicEventPage {
  canonicalSlug: string;
  /** True when reached through a retired address; correct the URL. */
  redirected: boolean;
  theme: PageTheme;
  seo: PageSeo;
  blocks: PageBlock[];
  event: PublicEventApi;
  ratings?: EventPageRatings;
  resale?: EventPageResale;
}

export interface SlugCheck {
  slug: string;
  available: boolean;
  reason: string;
}
