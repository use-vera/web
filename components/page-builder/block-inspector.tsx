"use client";

import {
  OrganizerField,
  OrganizerTextarea,
} from "@/components/organizer/organizer-field";
import { Switch } from "@/components/organizer/organizer-primitives";
import { blockDefinition } from "@/lib/page-blocks-catalog";
import {
  type BlockType,
  type PageBlock,
  isBoundBlock,
  isLockedBlock,
} from "@/lib/types/event-page";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LogoUpload } from "@/components/page-builder/logo-upload";
import { Check, Lock, Palette, Plus, Trash2 } from "lucide-react";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-[12px] font-semibold">{label}</span>
    {children}
  </label>
);

const Toggle = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[13px]">{label}</span>
    <Switch checked={value} onChange={onChange} label={label} />
  </div>
);

type Repeatable = Record<string, string>;

const asList = (value: unknown): Repeatable[] =>
  Array.isArray(value) ? (value as Repeatable[]) : [];

/** Settings for whichever section is selected. */
/** What each bound block reads, so nobody tries to type into it. */
const BOUND_NOTICE: Partial<Record<BlockType, string>> = {
  tickets:
    "Tiers, prices, sale windows and remaining counts come from your ticket setup. Change them once and every page follows.",
  venue: "The address, map and directions come from the event's location.",
  countdown:
    "Counts down to your start time. Move the event and this follows it.",
  progress:
    "Reads the real number sold against your capacity. It cannot overstate demand.",
  phase:
    "Shows a presale or on-sale notice based on your sale window, then hides itself once the main sale is running.",
  organizer:
    "Your name, photo, title and Vera verification, straight from your profile.",
  reviews:
    "Ratings and reviews left on this event. Hidden until someone has rated it.",
  resale:
    "How many tickets are on the resale marketplace right now, and your markup cap.",
};

export const BlockInspector = ({
  block,
  onChange,
  onRemove,
}: {
  block: PageBlock | null;
  onChange: (id: string, props: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
}) => {
  const { eventId } = useParams<{ eventId: string }>();

  if (!block) {
    return (
      <aside className="hidden w-[300px] shrink-0 border-l border-border bg-card lg:block">
        <div className=" h-full items-center justify-center px-8 text-center flex flex-col gap-3">
          <Palette className="text-muted-foreground" />
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Pick a section on the page to change it.
          </p>
        </div>
      </aside>
    );
  }

  const definition = blockDefinition(block.type);
  const props = block.props;
  const text = (key: string) =>
    typeof props[key] === "string" ? (props[key] as string) : "";
  const flag = (key: string, fallback = true) =>
    typeof props[key] === "boolean" ? (props[key] as boolean) : fallback;
  const set = (key: string, value: unknown) =>
    onChange(block.id, { [key]: value });

  return (
    <aside className="w-full shrink-0 border-t border-border bg-card lg:min-h-0 lg:w-[300px] lg:overflow-y-auto lg:border-t-0 lg:border-l">
      <div className="border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold">
            {definition?.label ?? block.type}
          </span>
          {isLockedBlock(block.type) ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          ) : null}
        </div>
        {definition ? (
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            {definition.description}
          </p>
        ) : null}
      </div>

      {isBoundBlock(block.type) ? (
        <div className="border-b border-border bg-accent px-4 py-3.5">
          <div className="flex gap-2.5">
            <Check
              className="mt-px h-3.5 w-3.5 shrink-0 text-accent-foreground"
              strokeWidth={2.5}
            />
            <div>
              <div className="text-[12px] font-bold text-accent-foreground">
                Live from your event
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-accent-foreground/85">
                {BOUND_NOTICE[block.type] ??
                  "This section reads your event, so it stays right on its own."}
              </p>
              <Link
                href={
                  block.type === "tickets"
                    ? `/organizer/events/${eventId}/edit`
                    : `/organizer/events/${eventId}/edit`
                }
                className="mt-2 inline-block text-[11px] font-bold text-accent-foreground underline underline-offset-2"
              >
                {block.type === "tickets"
                  ? "Edit tickets & pricing"
                  : "Edit the event"}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 p-4">
        {block.type === "hero" ? (
          <>
            <Field label="Eyebrow">
              <OrganizerField
                value={text("eyebrow")}
                placeholder="On sale now"
                className="h-10 text-[13px]"
                onChange={(input) => set("eyebrow", input.target.value)}
              />
            </Field>
            <Field label="Headline">
              <OrganizerTextarea
                value={text("headline")}
                rows={2}
                className="text-[13px]"
                onChange={(input) => set("headline", input.target.value)}
              />
            </Field>
            <Field label="Supporting line">
              <OrganizerTextarea
                value={text("body")}
                rows={3}
                className="text-[13px]"
                onChange={(input) => set("body", input.target.value)}
              />
            </Field>
            <Field label="Button">
              <OrganizerField
                value={text("ctaLabel")}
                placeholder="Get tickets"
                className="h-10 text-[13px]"
                onChange={(input) => set("ctaLabel", input.target.value)}
              />
            </Field>
          </>
        ) : null}

        {block.type === "text" ? (
          <>
            <Field label="Heading">
              <OrganizerField
                value={text("heading")}
                className="h-10 text-[13px]"
                onChange={(input) => set("heading", input.target.value)}
              />
            </Field>
            <Field label="Body">
              <OrganizerTextarea
                value={text("body")}
                rows={7}
                className="text-[13px]"
                onChange={(input) => set("body", input.target.value)}
              />
            </Field>
          </>
        ) : null}

        {block.type === "tickets" ? (
          <>
            <Field label="Heading">
              <OrganizerField
                value={text("heading")}
                className="h-10 text-[13px]"
                onChange={(input) => set("heading", input.target.value)}
              />
            </Field>
            <Toggle
              label="Show sold-out tiers"
              value={flag("showSoldOut")}
              onChange={(next) => set("showSoldOut", next)}
            />
            <Toggle
              label="Show how many are left"
              value={flag("showRemaining")}
              onChange={(next) => set("showRemaining", next)}
            />
          </>
        ) : null}

        {block.type === "venue" ? (
          <>
            <Field label="Heading">
              <OrganizerField
                value={text("heading")}
                className="h-10 text-[13px]"
                onChange={(input) => set("heading", input.target.value)}
              />
            </Field>
            <Toggle
              label="Show the map"
              value={flag("showMap")}
              onChange={(next) => set("showMap", next)}
            />
          </>
        ) : null}

        {block.type === "countdown" ||
        block.type === "progress" ||
        block.type === "organizer" ||
        block.type === "reviews" ||
        block.type === "resale" ? (
          <Field label="Heading">
            <OrganizerField
              value={text("heading")}
              className="h-10 text-[13px]"
              onChange={(input) => set("heading", input.target.value)}
            />
          </Field>
        ) : null}

        {block.type === "countdown" ? (
          <Toggle
            label="Show the date underneath"
            value={flag("showDate")}
            onChange={(next) => set("showDate", next)}
          />
        ) : null}

        {block.type === "progress" ? (
          <Toggle
            label="Show the numbers, not just the bar"
            value={flag("showCount")}
            onChange={(next) => set("showCount", next)}
          />
        ) : null}

        {block.type === "organizer" ? (
          <Field label="A line about you">
            <OrganizerTextarea
              value={text("body")}
              rows={4}
              placeholder="Optional. Your name, photo and verification are already pulled in."
              className="text-[13px]"
              onChange={(input) => set("body", input.target.value)}
            />
          </Field>
        ) : null}

        {block.type === "reviews" ? (
          <Field label="How many reviews to show">
            <OrganizerField
              type="number"
              min={1}
              max={6}
              value={String(typeof props.limit === "number" ? props.limit : 3)}
              className="h-10 text-[13px]"
              onChange={(input) =>
                set(
                  "limit",
                  Math.max(1, Math.min(6, Number(input.target.value) || 3)),
                )
              }
            />
          </Field>
        ) : null}

        {block.type === "phase" ? (
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Nothing to set. This one writes itself from your sale window, and
            disappears once the main sale is running.
          </p>
        ) : null}

        {block.type === "lineup" ||
        block.type === "faq" ||
        block.type === "sponsors" ? (
          <RepeatableItems
            block={block}
            heading={text("heading")}
            onHeading={(value) => set("heading", value)}
            onItems={(items) => set("items", items)}
          />
        ) : null}
      </div>

      {!isLockedBlock(block.type) ? (
        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={() => onRemove(block.id)}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-destructive/50 text-[13px] font-semibold text-destructive transition-colors hover:bg-destructive/10 active:scale-[0.98]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove section
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-2 border-t border-border p-4">
          <Lock className="mt-px h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {block.type === "tickets"
              ? "Every page keeps a way to buy. Move or restyle it, but it stays."
              : "The footer carries refund and resale terms, so it stays on every page."}
          </p>
        </div>
      )}
    </aside>
  );
};

/** Line-up, questions and sponsors are all "a heading plus a list of pairs". */
const RepeatableItems = ({
  block,
  heading,
  onHeading,
  onItems,
}: {
  block: PageBlock;
  heading: string;
  onHeading: (value: string) => void;
  onItems: (items: Repeatable[]) => void;
}) => {
  const items = asList(block.props.items);

  const fields: [string, string][] =
    block.type === "faq"
      ? [
          ["question", "Question"],
          ["answer", "Answer"],
        ]
      : block.type === "lineup"
        ? [
            ["name", "Name"],
            ["time", "Time"],
          ]
        : [["name", "Name"]];

  /* The renderer read `imageUrl`; nothing ever wrote it. */
  const artwork: { label: string; shape: "wide" | "square" } | null =
    block.type === "sponsors"
      ? { label: "Add logo", shape: "wide" }
      : block.type === "lineup"
        ? { label: "Add photo", shape: "square" }
        : null;

  const update = (index: number, key: string, value: string | undefined) =>
    onItems(
      items.map((item, i) => {
        if (i !== index) {
          return item;
        }

        if (value === undefined) {
          /* Drop the key rather than storing "". The renderer branches on the
             property being present. */
          const rest = { ...item };
          delete rest[key];
          return rest;
        }

        return { ...item, [key]: value };
      }),
    );

  return (
    <>
      <Field label="Heading">
        <OrganizerField
          value={heading}
          className="h-10 text-[13px]"
          onChange={(input) => onHeading(input.target.value)}
        />
      </Field>

      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-sm p-2.5 ring-1 ring-border ring-inset"
          >
            {fields.map(([key, label]) =>
              key === "answer" ? (
                <OrganizerTextarea
                  key={key}
                  value={item[key] ?? ""}
                  rows={2}
                  placeholder={label}
                  className="text-[13px]"
                  onChange={(input) => update(index, key, input.target.value)}
                />
              ) : (
                <OrganizerField
                  key={key}
                  value={item[key] ?? ""}
                  placeholder={label}
                  className="h-9 text-[13px]"
                  onChange={(input) => update(index, key, input.target.value)}
                />
              ),
            )}
            {artwork ? (
              <LogoUpload
                value={item.imageUrl}
                label={artwork.label}
                shape={artwork.shape}
                onChange={(url) => update(index, "imageUrl", url)}
              />
            ) : null}
            <button
              type="button"
              onClick={() => onItems(items.filter((_, i) => i !== index))}
              className="cursor-pointer self-end text-[11px] font-semibold text-muted-foreground transition-colors hover:text-destructive"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onItems([...items, {}])}
        className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border text-[13px] font-semibold transition-colors hover:bg-secondary active:scale-[0.98]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </button>
    </>
  );
};
