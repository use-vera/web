"use client";

import { CategoryPicker } from "@/components/organizer/category-picker";
import { LocationMap } from "@/components/location-map";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ImageUpload } from "@/components/organizer/image-upload";
import {
  DEFAULT_LOCATION,
  LocationPicker,
} from "@/components/organizer/location-picker";
import {
  OrganizerField,
  OrganizerTextarea,
} from "@/components/organizer/organizer-field";
import {
  Eyebrow,
  SectionLabel,
  Switch,
} from "@/components/organizer/organizer-primitives";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { formatNairaAmount, formatNairaCompact } from "@/lib/format-currency";
import { useCategories } from "@/lib/hooks/use-categories";
import { useCreateEvent } from "@/lib/hooks/use-organizer";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import {
  capacityOf,
  draftToPayload,
  grossIfSoldOut,
  PLATFORM_FEE_PERCENT,
  validateStep,
  type EventDraft,
} from "@/lib/organizer-draft";
import { type EventTicketCategoryPayload } from "@/lib/types/organizer";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  MapPin,
  Plus,
  Repeat,
  Trash2,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const STEPS = ["Basics", "Where", "When", "Tickets", "Review"] as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIMEZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Europe/London",
  "America/New_York",
];

const emptyDraft = (): EventDraft => ({
  name: "",
  description: "",
  categoryIds: [],
  location: { ...DEFAULT_LOCATION },
  startsAt: "",
  endsAt: "",
  timezone: "Africa/Lagos",
  recurrenceType: "none",
  recurrenceInterval: 1,
  recurrenceDays: [],
  recurrenceEndsOn: "",
  isPaid: true,
  feeMode: "absorbed_by_organizer",
  tiers: [{ name: "General admission", quantity: 100, priceNaira: 5000 }],
  salesStartsAt: "",
  presaleEnabled: false,
  presaleStartsAt: "",
  presaleEndsAt: "",
  presaleQuantity: "",
  presalePriceNaira: "",
  resaleEnabled: true,
  resaleAllowBids: true,
  resaleMaxMarkupPercent: 25,
  resaleBidWindowHours: 12,
});

const Select = ({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  options: string[];
  label: string;
}) => (
  <div className="relative">
    <select
      value={value}
      aria-label={label}
      onChange={(input) => onChange(input.target.value)}
      className="h-12 w-full cursor-pointer appearance-none rounded-md border border-border bg-background px-4 pr-10 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
    >
      <option value="">Select…</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  </div>
);

const NewEventPage = () => {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<EventDraft>(emptyDraft);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const set = <K extends keyof EventDraft>(key: K, value: EventDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const isDirty =
    draft.name.trim() !== "" ||
    draft.description.trim() !== "" ||
    draft.location.address.trim() !== "" ||
    Boolean(draft.imageUrl) ||
    draft.startsAt !== "" ||
    draft.endsAt !== "";

  const capacity = useMemo(() => capacityOf(draft), [draft]);
  const gross = useMemo(() => grossIfSoldOut(draft), [draft]);
  const fee = Math.round((gross * PLATFORM_FEE_PERCENT) / 100);
  const leadPrice = Number(draft.tiers[0]?.priceNaira) || 0;
  const feeOnLead = Math.round((leadPrice * PLATFORM_FEE_PERCENT) / 100);
  const stepValid = validateStep(draft, step);

  const categoriesQuery = useCategories();
  const selectedCategoryNames = useMemo(
    () =>
      (categoriesQuery.data ?? [])
        .filter((category) => draft.categoryIds.includes(category._id))
        .map((category) => category.name),
    [categoriesQuery.data, draft.categoryIds],
  );

  const cheapestTier = useMemo(
    () =>
      draft.tiers.reduce(
        (lowest, tier) => Math.min(lowest, Number(tier.priceNaira) || 0),
        Number.POSITIVE_INFINITY,
      ),
    [draft.tiers],
  );

  const dateTime = (value: string) =>
    value
      ? new Intl.DateTimeFormat("en-NG", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date(value))
      : "Not set";

  const startLabel = dateTime(draft.startsAt);
  const endLabel = dateTime(draft.endsAt);

  const repeatSummary =
    draft.recurrenceType === "none"
      ? "One-off"
      : draft.recurrenceType === "weekly"
        ? `Weekly on ${[...draft.recurrenceDays]
            .sort((a, b) => a - b)
            .map((day) => WEEKDAYS[day])
            .join(", ")}`
        : "Monthly";

  /* Things that are legal but usually mistakes — surfaced before publish
     rather than discovered after tickets are on sale. */
  const warnings = useMemo(() => {
    const found: string[] = [];

    if (!draft.imageUrl) {
      found.push("No cover image. Events with one get noticeably more views.");
    }

    if (!draft.description.trim()) {
      found.push("No description yet.");
    }

    if (draft.categoryIds.length === 0) {
      found.push("No categories picked, so it will be harder to discover.");
    }

    if (
      draft.presaleEnabled &&
      (!draft.presaleStartsAt || !draft.presaleEndsAt)
    ) {
      found.push("Presale is on but its window is incomplete.");
    }

    if (capacity > 0 && capacity < 10) {
      found.push(`Capacity is only ${capacity}. Check your tier quantities.`);
    }

    return found;
  }, [draft, capacity]);

  const updateTier = (
    index: number,
    patch: Partial<EventTicketCategoryPayload>,
  ) =>
    setDraft((current) => ({
      ...current,
      tiers: current.tiers.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, ...patch } : tier,
      ),
    }));

  const submit = async (status: "draft" | "published") => {
    try {
      const created = await createEvent.mutateAsync(
        draftToPayload(draft, status),
      );
      toast.success(status === "published" ? "Event published" : "Draft saved");
      router.push(`/organizer/events/${created._id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't create the event"));
    }
  };

  const isNigeria = draft.location.country
    .toLowerCase()
    .includes("nigeria");

  return (
    <div className="flex min-h-screen flex-col">
      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Leave without saving?"
        description={
          <>
            This event has not been created yet, so everything you have filled
            in — the location, {draft.tiers.length === 1 ? "your ticket tier" : `all ${draft.tiers.length} ticket tiers`}
            {draft.imageUrl ? ", the cover image" : ""} — will be lost. Save it
            as a draft instead to come back to it later.
          </>
        }
        confirmLabel="Discard this event"
        cancelLabel="Keep editing"
        onConfirm={() => router.push("/organizer/events")}
      />

      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            aria-label="Leave without saving"
            onClick={() =>
              isDirty ? setConfirmLeave(true) : router.push("/organizer/events")
            }
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div>
            <div className="text-[15px] font-semibold">
              {draft.name.trim() || "New event"}
            </div>
            <div className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length} &middot; {STEPS[step]}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {step > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setStep((current) => current - 1)}
            >
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button
              size="sm"
              disabled={!stepValid}
              onClick={() => setStep((current) => current + 1)}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                loading={createEvent.isPending}
                onClick={() => submit("draft")}
              >
                Save draft
              </Button>
              <Button
                size="sm"
                loading={createEvent.isPending}
                onClick={() => submit("published")}
              >
                Publish
              </Button>
            </>
          )}
        </div>
      </header>

      <hr className="ticket-perforation" />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="w-full border-b border-border px-4 py-3 lg:w-[280px] lg:shrink-0 lg:border-b-0 lg:px-6 lg:py-8">
          {/* Horizontal on a phone so the form starts near the top; the next
              step peeks past the edge so the row reads as scrollable. */}
          <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
            {STEPS.map((label, index) => {
              const done = index < step;
              const now = index === step;

              return (
                <button
                  key={label}
                  type="button"
                  disabled={index > step}
                  onClick={() => setStep(index)}
                  className={cn(
                    "flex h-11 shrink-0 items-center gap-2.5 rounded-sm px-3 text-left transition-colors lg:h-10 lg:w-full lg:shrink lg:gap-3",
                    now && "bg-muted",
                    index > step ? "cursor-default" : "cursor-pointer",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      done && "bg-primary text-primary-foreground",
                      now && "bg-foreground text-background",
                      !done &&
                        !now &&
                        "text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      now || done
                        ? "font-semibold text-foreground"
                        : "font-medium text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-7 px-4 py-6 sm:px-6 lg:flex-row lg:py-8 lg:pr-8 lg:pl-2">
          <div className="min-w-0 w-full lg:max-w-[700px] lg:flex-1">
            {step === 0 ? (
              <>
                <h2 className="text-[22px] leading-tight font-bold tracking-[-0.02em]">
                  The basics
                </h2>
                <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
                  What it is called, what it looks like, and where it belongs.
                </p>

                <div className="flex flex-col gap-5">
                  <label className="block">
                    <SectionLabel>Event name</SectionLabel>
                    <OrganizerField
                      value={draft.name}
                      onChange={(input) => set("name", input.target.value)}
                      placeholder="Afrobeats Night Lagos"
                      maxLength={140}
                    />
                  </label>

                  <div>
                    <SectionLabel hint="Landscape images look best — this is the first thing people see.">
                      Cover image
                    </SectionLabel>
                    <ImageUpload
                      value={draft.imageUrl}
                      onChange={(url) => set("imageUrl", url)}
                    />
                  </div>

                  <label className="block">
                    <SectionLabel
                      hint={`${draft.description.length} of 1200 characters`}
                    >
                      Description
                    </SectionLabel>
                    <OrganizerTextarea
                      value={draft.description}
                      onChange={(input) => set("description", input.target.value)}
                      rows={5}
                      maxLength={1200}
                      placeholder="Who is playing, what the night looks like, anything people should turn up knowing."
                    />
                  </label>

                  <div>
                    <SectionLabel hint="Helps the right people find it. Pick up to ten.">
                      Categories
                    </SectionLabel>
                    <CategoryPicker
                      value={draft.categoryIds}
                      onChange={(next) => set("categoryIds", next)}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <h2 className="text-[22px] leading-tight font-bold tracking-[-0.02em]">
                  Where it happens
                </h2>
                <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
                  Search a venue, use your location, or drop a pin on the map.
                </p>

                <LocationPicker
                  value={draft.location}
                  onChange={(next) => set("location", next)}
                />

                <div className="mt-5 flex flex-col gap-5">
                  <label className="block">
                    <SectionLabel hint="What attendees will read on the ticket.">
                      Address
                    </SectionLabel>
                    <OrganizerField
                      value={draft.location.address}
                      onChange={(input) =>
                        set("location", {
                          ...draft.location,
                          address: input.target.value,
                        })
                      }
                      placeholder="Muri Okunola Park, Victoria Island"
                      maxLength={300}
                    />
                  </label>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1">
                      <SectionLabel>Country</SectionLabel>
                      <OrganizerField
                        value={draft.location.country}
                        onChange={(input) =>
                          set("location", {
                            ...draft.location,
                            country: input.target.value,
                          })
                        }
                        placeholder="Nigeria"
                      />
                    </div>
                    <div className="flex-1">
                      <SectionLabel>State</SectionLabel>
                      {isNigeria ? (
                        <Select
                          label="State"
                          value={draft.location.state}
                          onChange={(next) =>
                            set("location", { ...draft.location, state: next })
                          }
                          options={NIGERIAN_STATES}
                        />
                      ) : (
                        <OrganizerField
                          value={draft.location.state}
                          onChange={(input) =>
                            set("location", {
                              ...draft.location,
                              state: input.target.value,
                            })
                          }
                          placeholder="State or region"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h2 className="text-[22px] leading-tight font-bold tracking-[-0.02em]">
                  When it happens
                </h2>
                <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
                  Doors open, doors close, and whether it happens again.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <label className="flex-1">
                    <SectionLabel>Starts</SectionLabel>
                    <OrganizerField
                      type="datetime-local"
                      value={draft.startsAt}
                      onChange={(input) => set("startsAt", input.target.value)}
                    />
                  </label>
                  <label className="flex-1">
                    <SectionLabel>Ends</SectionLabel>
                    <OrganizerField
                      type="datetime-local"
                      value={draft.endsAt}
                      onChange={(input) => set("endsAt", input.target.value)}
                    />
                  </label>
                </div>

                {draft.startsAt &&
                draft.endsAt &&
                new Date(draft.endsAt) <= new Date(draft.startsAt) ? (
                  <p className="mt-3 text-[13px] font-semibold text-destructive">
                    The end time has to be after the start time.
                  </p>
                ) : null}

                <div className="mt-5 max-w-[320px]">
                  <SectionLabel hint="Times above are read in this zone.">
                    Timezone
                  </SectionLabel>
                  <Select
                    label="Timezone"
                    value={draft.timezone}
                    onChange={(next) => set("timezone", next)}
                    options={TIMEZONES}
                  />
                </div>

                <div className="mt-7">
                  <SectionLabel>Does it repeat?</SectionLabel>
                  <div className="inline-flex gap-1 rounded-full bg-muted p-1">
                    {[
                      { value: "none" as const, label: "One-off" },
                      { value: "weekly" as const, label: "Weekly" },
                      { value: "monthly-day" as const, label: "Monthly" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => set("recurrenceType", option.value)}
                        className={cn(
                          "inline-flex h-8 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                          draft.recurrenceType === option.value
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {draft.recurrenceType === "weekly" ? (
                  <div className="mt-5">
                    <SectionLabel>Which days?</SectionLabel>
                    <div className="flex gap-2">
                      {WEEKDAYS.map((day, index) => {
                        const selected = draft.recurrenceDays.includes(index);

                        return (
                          <button
                            key={day}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              set(
                                "recurrenceDays",
                                selected
                                  ? draft.recurrenceDays.filter((d) => d !== index)
                                  : [...draft.recurrenceDays, index],
                              )
                            }
                            className={cn(
                              "h-10 w-12 cursor-pointer rounded-md text-[13px] font-semibold transition-colors",
                              selected
                                ? "bg-primary text-primary-foreground"
                                : "border border-border text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {draft.recurrenceType !== "none" ? (
                  <div className="mt-5 max-w-[320px]">
                    <SectionLabel hint="Leave blank to repeat indefinitely.">
                      Stop repeating on
                    </SectionLabel>
                    <OrganizerField
                      type="date"
                      value={draft.recurrenceEndsOn}
                      onChange={(input) =>
                        set("recurrenceEndsOn", input.target.value)
                      }
                    />
                  </div>
                ) : null}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <h2 className="text-[22px] leading-tight font-bold tracking-[-0.02em]">
                  Tickets &amp; pricing
                </h2>
                <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
                  Set what people pay and what lands in your wallet.
                </p>

                <div className="mb-6 inline-flex gap-1 rounded-full bg-muted p-1">
                  {[
                    { paid: false, label: "Free entry" },
                    { paid: true, label: "Paid tickets" },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => set("isPaid", option.paid)}
                      className={cn(
                        "inline-flex h-8 cursor-pointer items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                        draft.isPaid === option.paid
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[13px] font-semibold">Ticket tiers</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {capacity.toLocaleString("en-NG")} tickets &middot;{" "}
                    {draft.tiers.length} of 12
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {draft.tiers.map((tier, index) => (
                    <Card key={index} className="flex-col items-stretch gap-2.5 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-3">
                      <label className="flex items-center gap-3 sm:contents">
                        <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground sm:hidden">
                          Name
                        </span>
                        <OrganizerField
                          value={tier.name}
                          onChange={(input) =>
                            updateTier(index, { name: input.target.value })
                          }
                          placeholder="Tier name"
                          aria-label={`Tier ${index + 1} name`}
                          className="h-10 min-w-0 flex-1"
                          maxLength={60}
                        />
                      </label>
                      <label className="flex items-center gap-3 sm:contents">
                        <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground sm:hidden">
                          Quantity
                        </span>
                        <OrganizerField
                          value={String(tier.quantity)}
                          onChange={(input) =>
                            updateTier(index, {
                              quantity: Number(input.target.value) || 0,
                            })
                          }
                          aria-label={`Tier ${index + 1} quantity`}
                          inputMode="numeric"
                          className="h-10 w-full text-right tabular-nums sm:w-[100px] sm:shrink-0"
                        />
                      </label>
                      {draft.isPaid ? (
                        <label className="flex items-center gap-3 sm:contents">
                          <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground sm:hidden">
                            Price ₦
                          </span>
                          <OrganizerField
                            value={String(tier.priceNaira ?? 0)}
                            onChange={(input) =>
                              updateTier(index, {
                                priceNaira: Number(input.target.value) || 0,
                              })
                            }
                            aria-label={`Tier ${index + 1} price in naira`}
                            inputMode="numeric"
                            className="h-10 w-full text-right tabular-nums sm:w-[120px] sm:shrink-0"
                          />
                        </label>
                      ) : null}
                      {draft.tiers.length > 1 ? (
                        <button
                          type="button"
                          aria-label={`Remove ${tier.name || "tier"}`}
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              tiers: current.tiers.filter(
                                (_, tierIndex) => tierIndex !== index,
                              ),
                            }))
                          }
                          className="shrink-0 cursor-pointer p-1 text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </Card>
                  ))}
                </div>

                {draft.tiers.length < 12 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2.5"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        tiers: [
                          ...current.tiers,
                          { name: "", quantity: 100, priceNaira: 0 },
                        ],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add a tier
                  </Button>
                ) : null}

                {draft.isPaid && leadPrice > 0 ? (
                  <>
                    <div className="mt-7">
                      <SectionLabel
                        hint={`Priced on ${draft.tiers[0]?.name || "your first tier"}, ${formatNairaAmount(leadPrice)}.`}
                      >
                        Who covers the {PLATFORM_FEE_PERCENT}% Vera fee?
                      </SectionLabel>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {[
                        {
                          mode: "absorbed_by_organizer" as const,
                          title: "I cover it",
                          rows: [
                            ["Attendee pays", formatNairaAmount(leadPrice)],
                            ["Vera fee", `−${formatNairaAmount(feeOnLead)}`],
                            ["You receive", formatNairaAmount(leadPrice - feeOnLead), true],
                          ],
                          foot: "Cleaner pricing. The number on the flyer is the number they pay.",
                        },
                        {
                          mode: "passed_to_attendee" as const,
                          title: "Attendee covers it",
                          rows: [
                            ["Attendee pays", formatNairaAmount(leadPrice + feeOnLead)],
                            ["Vera fee", `−${formatNairaAmount(feeOnLead)}`],
                            ["You receive", formatNairaAmount(leadPrice), true],
                          ],
                          foot: "You keep the full face value, but checkout shows a higher total.",
                        },
                      ].map((option) => {
                        const selected = draft.feeMode === option.mode;

                        return (
                          <button
                            key={option.mode}
                            type="button"
                            onClick={() => set("feeMode", option.mode)}
                            className={cn(
                              "flex-1 cursor-pointer rounded-sm p-4 text-left transition-colors",
                              selected
                                ? "bg-accent shadow-[inset_0_0_0_2px_var(--primary)]"
                                : "bg-card shadow-[inset_0_0_0_1px_var(--border)] hover:bg-muted/50",
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                                  selected
                                    ? "bg-primary text-primary-foreground"
                                    : "shadow-[inset_0_0_0_1px_var(--border)]",
                                )}
                              >
                                {selected ? (
                                  <Check className="h-2.5 w-2.5" strokeWidth={4} />
                                ) : null}
                              </span>
                              <span
                                className={cn(
                                  "text-sm font-semibold",
                                  selected && "text-accent-foreground",
                                )}
                              >
                                {option.title}
                              </span>
                            </span>
                            <span className="mt-3.5 flex flex-col gap-[7px]">
                              {option.rows.map(([key, value, strong]) => (
                                <span
                                  key={String(key)}
                                  className={cn(
                                    "flex justify-between text-[13px]",
                                    strong
                                      ? "font-semibold"
                                      : selected
                                        ? "text-accent-foreground/80"
                                        : "text-muted-foreground",
                                  )}
                                >
                                  <span>{key}</span>
                                  <span className="tabular-nums">{value}</span>
                                </span>
                              ))}
                            </span>
                            <hr className="ticket-perforation my-3" />
                            <span
                              className={cn(
                                "block text-xs leading-relaxed text-pretty",
                                selected
                                  ? "text-accent-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {option.foot}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-7">
                      <SectionLabel hint="Leave blank to sell from the moment you publish.">
                        When tickets go on sale
                      </SectionLabel>
                      <OrganizerField
                        type="datetime-local"
                        value={draft.salesStartsAt}
                        onChange={(input) =>
                          set("salesStartsAt", input.target.value)
                        }
                        className="max-w-[320px]"
                      />
                    </div>

                    <Card className="mt-4 gap-0 py-0">
                      <div className="flex items-center justify-between px-4 py-3.5">
                        <div>
                          <span className="block text-sm font-semibold">
                            Run a presale
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            A cheaper batch before general sale opens.
                          </span>
                        </div>
                        <Switch
                          checked={draft.presaleEnabled}
                          onChange={(next) => set("presaleEnabled", next)}
                          label="Run a presale"
                        />
                      </div>
                      {draft.presaleEnabled ? (
                        <>
                          <hr className="ticket-perforation" />
                          <div className="flex flex-col gap-4 px-4 py-4">
                            <div className="flex flex-col gap-4 sm:flex-row">
                              <label className="flex-1">
                                <SectionLabel>Presale opens</SectionLabel>
                                <OrganizerField
                                  type="datetime-local"
                                  value={draft.presaleStartsAt}
                                  onChange={(input) =>
                                    set("presaleStartsAt", input.target.value)
                                  }
                                />
                              </label>
                              <label className="flex-1">
                                <SectionLabel>Presale closes</SectionLabel>
                                <OrganizerField
                                  type="datetime-local"
                                  value={draft.presaleEndsAt}
                                  onChange={(input) =>
                                    set("presaleEndsAt", input.target.value)
                                  }
                                />
                              </label>
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row">
                              <label className="flex-1">
                                <SectionLabel>How many</SectionLabel>
                                <OrganizerField
                                  value={draft.presaleQuantity}
                                  onChange={(input) =>
                                    set("presaleQuantity", input.target.value)
                                  }
                                  inputMode="numeric"
                                  placeholder="200"
                                  className="tabular-nums"
                                />
                              </label>
                              <label className="flex-1">
                                <SectionLabel>Presale price</SectionLabel>
                                <OrganizerField
                                  value={draft.presalePriceNaira}
                                  onChange={(input) =>
                                    set("presalePriceNaira", input.target.value)
                                  }
                                  inputMode="numeric"
                                  placeholder="3500"
                                  className="tabular-nums"
                                />
                              </label>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </Card>

                    <Card className="mt-3 gap-0 py-0">
                      <div className="flex items-center justify-between px-4 py-3.5">
                        <div>
                          <span className="block text-sm font-semibold">
                            Allow resale
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            Vera reissues a fresh QR, so the old one dies.
                          </span>
                        </div>
                        <Switch
                          checked={draft.resaleEnabled}
                          onChange={(next) => set("resaleEnabled", next)}
                          label="Allow resale"
                        />
                      </div>
                      {draft.resaleEnabled ? (
                        <>
                          <hr className="ticket-perforation" />
                          <div className="flex flex-col gap-3.5 px-4 py-4">
                            <label className="flex items-center justify-between gap-4">
                              <span className="text-[13px] text-muted-foreground">
                                Price ceiling above face value
                              </span>
                              <span className="flex items-center gap-2">
                                <OrganizerField
                                  value={String(draft.resaleMaxMarkupPercent)}
                                  onChange={(input) =>
                                    set(
                                      "resaleMaxMarkupPercent",
                                      Math.min(
                                        100,
                                        Math.max(0, Number(input.target.value) || 0),
                                      ),
                                    )
                                  }
                                  inputMode="numeric"
                                  aria-label="Maximum resale markup percent"
                                  className="h-10 w-20 text-right tabular-nums"
                                />
                                <span className="text-[13px] font-semibold">%</span>
                              </span>
                            </label>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[13px] text-muted-foreground">
                                Accept bids
                              </span>
                              <Switch
                                checked={draft.resaleAllowBids}
                                onChange={(next) => set("resaleAllowBids", next)}
                                label="Accept resale bids"
                              />
                            </div>
                          </div>
                        </>
                      ) : null}
                    </Card>
                  </>
                ) : null}
              </>
            ) : null}

            {step === 4 ? (
              <>
                <h2 className="text-[22px] leading-tight font-bold tracking-[-0.02em]">
                  Review &amp; publish
                </h2>
                <p className="mt-1.5 mb-6 text-sm text-muted-foreground">
                  Everything you have set, the way attendees will meet it.
                  Publish puts it on sale straight away.
                </p>

                {/* How the event card reads in the feed */}
                <Card className="gap-0 overflow-hidden py-0">
                  {draft.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.imageUrl}
                      alt=""
                      className="h-[220px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[120px] items-center justify-center bg-muted text-xs text-muted-foreground">
                      No cover image — it will show a placeholder in the feed
                    </div>
                  )}
                  <div className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl font-bold tracking-[-0.01em]">
                        {draft.name || "Untitled event"}
                      </span>
                      {draft.isPaid ? (
                        <Badge>
                          from {formatNairaAmount(cheapestTier)}
                        </Badge>
                      ) : (
                        <Badge variant="solid">Free</Badge>
                      )}
                      {draft.recurrenceType !== "none" ? (
                        <Badge variant="outline">
                          <Repeat className="h-3 w-3" />
                          {repeatSummary}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {startLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {[draft.location.address, draft.location.state]
                          .filter(Boolean)
                          .join(", ") || "No address set"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Users className="h-3.5 w-3.5" />
                        {capacity.toLocaleString("en-NG")} capacity
                      </span>
                    </div>

                    {draft.description ? (
                      <p className="mt-3.5 text-[13px] leading-relaxed text-pretty text-muted-foreground">
                        {draft.description}
                      </p>
                    ) : (
                      <p className="mt-3.5 text-[13px] text-muted-foreground italic">
                        No description yet. Events with one sell better.
                      </p>
                    )}

                    {selectedCategoryNames.length > 0 ? (
                      <div className="mt-3.5 flex flex-wrap gap-2">
                        {selectedCategoryNames.map((name) => (
                          <Badge key={name} variant="outline">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Card>

                {/* Where, on the map, with the real check-in radius */}
                <div className="mt-3.5">
                  <SectionLabel
                    hint={`Anyone scanning in has to be within ${draft.location.geofenceRadiusMeters}m of this pin.`}
                  >
                    Where it happens
                  </SectionLabel>
                  <LocationMap
                    latitude={draft.location.latitude}
                    longitude={draft.location.longitude}
                    radiusMeters={draft.location.geofenceRadiusMeters}
                    interactive={false}
                    className="h-[240px]"
                  />
                  <p className="mt-2 text-xs text-muted-foreground tabular-nums">
                    {draft.location.latitude.toFixed(5)},{" "}
                    {draft.location.longitude.toFixed(5)}
                    {draft.location.eventCenterId
                      ? " · linked to a known venue"
                      : ""}
                  </p>
                </div>

                {/* Every tier, priced out */}
                <div className="mt-5">
                  <SectionLabel>Tickets</SectionLabel>
                  <Card className="gap-0 py-0">
                    {draft.tiers.map((tier, index) => (
                      <div key={index}>
                        {index > 0 ? <hr className="ticket-perforation" /> : null}
                        <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold">
                              {tier.name || "Untitled tier"}
                            </div>
                            <div className="text-xs text-muted-foreground tabular-nums">
                              {Number(tier.quantity).toLocaleString("en-NG")}{" "}
                              available
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-[13px] font-semibold tabular-nums">
                              {draft.isPaid
                                ? formatNairaAmount(Number(tier.priceNaira) || 0)
                                : "Free"}
                            </div>
                            <div className="text-xs text-muted-foreground tabular-nums">
                              {formatNairaCompact(
                                (Number(tier.quantity) || 0) *
                                  (draft.isPaid
                                    ? Number(tier.priceNaira) || 0
                                    : 0),
                              )}{" "}
                              if it sells out
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>

                {/* The settings that are easy to get wrong */}
                <div className="mt-5">
                  <SectionLabel>Everything else</SectionLabel>
                  <Card className="gap-0 py-0">
                    {[
                      ["Ends", endLabel],
                      ["Timezone", draft.timezone],
                      ["Repeats", repeatSummary],
                      [
                        "Fee",
                        draft.isPaid
                          ? draft.feeMode === "absorbed_by_organizer"
                            ? `You cover the ${PLATFORM_FEE_PERCENT}%`
                            : `Attendees cover the ${PLATFORM_FEE_PERCENT}%`
                          : "No fee on free events",
                      ],
                      [
                        "Sales open",
                        draft.salesStartsAt
                          ? new Intl.DateTimeFormat("en-NG", {
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }).format(new Date(draft.salesStartsAt))
                          : "As soon as it is published",
                      ],
                      [
                        "Presale",
                        draft.presaleEnabled
                          ? `${draft.presaleQuantity || "?"} tickets${draft.presalePriceNaira ? ` at ${formatNairaAmount(Number(draft.presalePriceNaira))}` : ""}`
                          : "Off",
                      ],
                      [
                        "Resale",
                        draft.resaleEnabled
                          ? `Allowed up to +${draft.resaleMaxMarkupPercent}%${draft.resaleAllowBids ? ", bids on" : ", bids off"}`
                          : "Not allowed",
                      ],
                      [
                        "Check-in radius",
                        `${draft.location.geofenceRadiusMeters}m`,
                      ],
                    ].map(([key, value], index) => (
                      <div key={String(key)}>
                        {index > 0 ? <hr className="ticket-perforation" /> : null}
                        <div className="flex items-baseline justify-between gap-6 px-5 py-3">
                          <span className="shrink-0 text-[13px] text-muted-foreground">
                            {key}
                          </span>
                          <span className="min-w-0 text-right text-[13px] font-semibold">
                            {value || "—"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>

                {warnings.length > 0 ? (
                  <div className="mt-5 rounded-sm bg-muted/60 p-4">
                    <span className="flex items-center gap-2 text-[13px] font-semibold">
                      <TriangleAlert className="h-4 w-4 text-muted-foreground" />
                      Worth a look before you publish
                    </span>
                    <ul className="mt-2.5 flex flex-col gap-1.5">
                      {warnings.map((warning) => (
                        <li
                          key={warning}
                          className="text-[13px] text-muted-foreground"
                        >
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          {step === 3 || step === 4 ? (
            <div className="w-full lg:w-[308px] lg:shrink-0">
              <Card className="sticky top-8 gap-0 py-0">
                <div className="px-4 py-4">
                  <Eyebrow>If it sells out</Eyebrow>
                  <div className="mt-1.5 text-[28px] font-bold tracking-[-0.02em] tabular-nums">
                    {formatNairaCompact(gross)}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                    {capacity.toLocaleString("en-NG")} tickets across{" "}
                    {draft.tiers.length}{" "}
                    {draft.tiers.length === 1 ? "tier" : "tiers"}
                  </div>
                </div>
                <hr className="ticket-perforation" />
                <div className="flex flex-col gap-2.5 px-4 py-4">
                  {draft.tiers.map((tier, index) => (
                    <div key={index} className="flex justify-between text-[13px]">
                      <span className="min-w-0 truncate text-muted-foreground">
                        {tier.name || "Untitled"} &times; {tier.quantity}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {formatNairaCompact(
                          (Number(tier.quantity) || 0) *
                            (draft.isPaid ? Number(tier.priceNaira) || 0 : 0),
                        )}
                      </span>
                    </div>
                  ))}
                  {draft.isPaid ? (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-muted-foreground">
                        Vera fee ({PLATFORM_FEE_PERCENT}%)
                      </span>
                      <span className="font-semibold tabular-nums">
                        −{formatNairaCompact(fee)}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center justify-between bg-muted px-4 py-3.5">
                  <span className="text-[13px] font-semibold">
                    Lands in your wallet
                  </span>
                  <span className="text-[15px] font-bold tabular-nums">
                    {formatNairaCompact(gross - fee)}
                  </span>
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NewEventPage;
