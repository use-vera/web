import { type BlockType } from "@/lib/types/event-page";

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  /** Reads the event record rather than carrying its own content. */
  bound: boolean;
  defaults: Record<string, unknown>;
}

/** A fixed list, not a free canvas: every section here is already responsive. */
export const BLOCK_CATALOG: BlockDefinition[] = [
  {
    type: "tickets",
    label: "Tickets",
    description: "Tiers, prices, sale windows and checkout.",
    bound: true,
    defaults: { heading: "Tickets", layout: "list", showSoldOut: true, showRemaining: true },
  },
  {
    type: "venue",
    label: "Venue & directions",
    description: "Address, map, and a button that opens Google Maps.",
    bound: true,
    defaults: { heading: "Getting there", showMap: true },
  },
  {
    type: "countdown",
    label: "Countdown",
    description: "Time left until doors open. Follows the event if it moves.",
    bound: true,
    defaults: { heading: "Doors open in", showDate: true },
  },
  {
    type: "progress",
    label: "Tickets sold",
    description: "How many have gone, from the real count. No invented urgency.",
    bound: true,
    defaults: { heading: "Selling now", style: "bar", showCount: true },
  },
  {
    type: "phase",
    label: "Sale notice",
    description: "Presale or on-sale banner that flips itself when the window turns.",
    bound: true,
    defaults: {},
  },
  {
    type: "organizer",
    label: "Organizer",
    description: "Who is running this, with their Vera verification.",
    bound: true,
    defaults: { heading: "Presented by", body: "" },
  },
  {
    type: "reviews",
    label: "Reviews",
    description: "Ratings and what people wrote about past editions.",
    bound: true,
    defaults: { heading: "What people said", limit: 3 },
  },
  {
    type: "resale",
    label: "Resale",
    description: "Sold out is not a dead end. Capped, verified fan-to-fan resale.",
    bound: true,
    defaults: { heading: "Sold out? Try resale" },
  },
  {
    type: "hero",
    label: "Hero",
    description: "Cover image, the title, and one clear action.",
    bound: false,
    defaults: { eyebrow: "", headline: "", body: "", ctaLabel: "Get tickets", imageUrl: "" },
  },
  {
    type: "text",
    label: "Text",
    description: "A heading and a few paragraphs.",
    bound: false,
    defaults: { heading: "About this event", body: "" },
  },
  {
    type: "lineup",
    label: "Line-up",
    description: "Artists or speakers with photos and set times.",
    bound: false,
    defaults: { heading: "Line-up", items: [{ name: "", time: "", imageUrl: "" }] },
  },
  {
    type: "faq",
    label: "Questions",
    description: "Answers to what people always ask.",
    bound: false,
    defaults: { heading: "Questions", items: [{ question: "", answer: "" }] },
  },
  {
    type: "sponsors",
    label: "Sponsors",
    description: "Partner logos in a quiet row.",
    bound: false,
    defaults: { heading: "With", items: [{ name: "", imageUrl: "" }] },
  },
];

export const blockDefinition = (type: BlockType) =>
  BLOCK_CATALOG.find((definition) => definition.type === type);
