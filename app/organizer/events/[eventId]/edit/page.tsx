"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { AmountField } from "@/components/organizer/amount-field";
import { CategoryPicker } from "@/components/organizer/category-picker";
import { EventStatusBadge } from "@/components/organizer/event-status-badge";
import { ImageUpload } from "@/components/organizer/image-upload";
import {
  DEFAULT_LOCATION,
  LocationPicker,
  type EventLocation,
} from "@/components/organizer/location-picker";
import {
  OrganizerField,
  OrganizerTextarea,
} from "@/components/organizer/organizer-field";
import { SectionLabel } from "@/components/organizer/organizer-primitives";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { COUNTRIES, subdivisionLabel, subdivisionsFor } from "@/lib/countries";
import { formatNairaAmount } from "@/lib/format-currency";
import {
  useCancelEvent,
  useDeleteEvent,
  useEventTickets,
  useNotifyAttendees,
  useOrganizerEvent,
  useUpdateEvent,
} from "@/lib/hooks/use-organizer";
import {
  buildChangeAnnouncement,
  getEditPermissions,
  summariseChanges,
} from "@/lib/organizer-edit-rules";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronDown, Lock, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

/** datetime-local wants a local wall-clock string, not an ISO instant. */
const toLocalInput = (iso: string) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

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
      className="h-12 w-full cursor-pointer appearance-none rounded-md border border-border bg-background px-4 pr-10 text-sm transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
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

const Section = ({
  title,
  hint,
  locked,
  children,
}: {
  title: string;
  hint?: string;
  locked?: string;
  children: React.ReactNode;
}) => (
  <section className="border-t border-border pt-7 first:border-t-0 first:pt-0">
    <div className="mb-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="text-base font-semibold">{title}</h2>
        {locked ? (
          <Badge variant="outline">
            <Lock className="h-3 w-3" />
            Locked
          </Badge>
        ) : null}
      </div>
      {locked ? (
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-pretty text-muted-foreground">
          {locked}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
    <div className={cn(locked && "pointer-events-none opacity-55")}>
      {children}
    </div>
  </section>
);

const EditEventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();

  const eventQuery = useOrganizerEvent(eventId);
  const ticketsQuery = useEventTickets(eventId, { limit: 1 });
  const updateEvent = useUpdateEvent(eventId);
  const deleteEvent = useDeleteEvent(eventId);
  const cancelEvent = useCancelEvent(eventId);
  const notify = useNotifyAttendees(eventId);

  const event = eventQuery.data?.event;
  const issuedTickets = ticketsQuery.data?.totalItems ?? 0;
  const rules = getEditPermissions(issuedTickets);

  const [form, setForm] = useState<{
    name?: string;
    description?: string;
    imageUrl?: string;
    categoryIds?: string[];
    location?: EventLocation;
    startsAt?: string;
    endsAt?: string;
  }>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  /* Edits layer over the loaded event, so untouched fields track a refetch. */
  const value = useMemo(() => {
    const location: EventLocation = form.location ?? {
      ...DEFAULT_LOCATION,
      address: event?.address ?? "",
      state: event?.state ?? "",
      country: "Nigeria",
      latitude: event?.latitude ?? DEFAULT_LOCATION.latitude,
      longitude: event?.longitude ?? DEFAULT_LOCATION.longitude,
      geofenceRadiusMeters: event?.geofenceRadiusMeters ?? 150,
    };

    return {
      name: form.name ?? event?.name ?? "",
      description: form.description ?? event?.description ?? "",
      imageUrl: form.imageUrl ?? event?.imageUrl,
      categoryIds:
        form.categoryIds ??
        (event?.categoryIds ?? []).map((category) =>
          typeof category === "string" ? category : category._id,
        ),
      location,
      startsAt: form.startsAt ?? toLocalInput(event?.startsAt ?? ""),
      endsAt: form.endsAt ?? toLocalInput(event?.endsAt ?? ""),
    };
  }, [form, event]);

  const set = <K extends keyof typeof form>(key: K, next: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: next }));

  const subdivisions = subdivisionsFor(value.location.country);

  const save = async () => {
    if (!event) {
      return;
    }

    const nextStartsAt = new Date(value.startsAt).toISOString();
    const nextEndsAt = new Date(value.endsAt).toISOString();

    if (new Date(nextEndsAt) <= new Date(nextStartsAt)) {
      toast.error("The end time has to be after the start time");
      return;
    }

    const change = summariseChanges(event, {
      name: value.name,
      address: value.location.address,
      latitude: value.location.latitude,
      longitude: value.location.longitude,
      startsAt: nextStartsAt,
      endsAt: nextEndsAt,
      imageUrl: value.imageUrl,
    });

    try {
      await updateEvent.mutateAsync({
        name: value.name.trim(),
        description: value.description.trim() || undefined,
        imageUrl: value.imageUrl || undefined,
        categoryIds: value.categoryIds,
        address: value.location.address.trim(),
        state: value.location.state.trim() || undefined,
        latitude: value.location.latitude,
        longitude: value.location.longitude,
        geofenceRadiusMeters: value.location.geofenceRadiusMeters,
        eventCenterId: value.location.eventCenterId,
        startsAt: nextStartsAt,
        endsAt: nextEndsAt,
      });

      /* Anyone holding a ticket planned around the old time and place. */
      if (
        rules.hasIssuedTickets &&
        (change.locationChanged || change.scheduleChanged)
      ) {
        const message = buildChangeAnnouncement(event, change, {
          address: value.location.address,
          startsAt: nextStartsAt,
        });

        if (message) {
          try {
            await notify.mutateAsync(message);
            toast.success("Saved, and attendees were told in the event chat");
          } catch {
            toast.warning(
              "Saved, but we couldn't post the update to the event chat",
            );
          }
        }
      } else {
        toast.success("Event updated");
      }

      router.push(`/organizer/events/${eventId}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't save those changes"));
    }
  };

  if (eventQuery.isLoading || !event) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-[500px] w-full rounded-sm" />
      </div>
    );
  }

  const tiers = event.ticketCategories ?? [];
  const pricingLock = rules.canEditPricing
    ? undefined
    : `${issuedTickets.toLocaleString("en-NG")} ${issuedTickets === 1 ? "ticket has" : "tickets have"} been issued, so prices, tiers and the free/paid setting are fixed. Everything else on this page can still change.`;

  // Handlers
  const handleDiscard = () => {
    router.push(`/organizer/events/${eventId}`);
  };

  return (
    <div className="pb-8">
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this event?"
        description="It disappears from Vera completely. This cannot be undone."
        confirmLabel="Delete event"
        cancelLabel="Keep it"
        loading={deleteEvent.isPending}
        onConfirm={async () => {
          try {
            await deleteEvent.mutateAsync();
            toast.success("Event deleted");
            router.push("/organizer/events");
          } catch (error) {
            toast.error(
              getApiErrorMessage(error, "Couldn't delete that event"),
            );
          }
        }}
      />

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this event?"
        description={`Every one of the ${issuedTickets.toLocaleString("en-NG")} issued ${issuedTickets === 1 ? "ticket" : "tickets"} is refunded automatically and each holder is notified. The event stays on Vera, marked cancelled.`}
        confirmLabel="Cancel and refund"
        cancelLabel="Keep it running"
        loading={cancelEvent.isPending}
        onConfirm={async () => {
          try {
            const result = await cancelEvent.mutateAsync(undefined);
            toast.success(
              `Cancelled. ${formatNairaAmount(result.totalRefundNaira)} refunded across ${result.affectedTicketCount} tickets`,
            );
            router.push(`/organizer/events/${eventId}`);
          } catch (error) {
            toast.error(
              getApiErrorMessage(error, "Couldn't cancel that event"),
            );
          }
        }}
      />

      <header className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-7">
        <Link
          href={`/organizer/events/${eventId}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {event.name}
        </Link>
        <h1 className="mt-3.5 text-[26px] leading-tight font-bold tracking-[-0.02em]">
          Edit event
        </h1>
      </header>

      <div className="max-w-3xl px-4 pt-6 sm:px-6 lg:px-8">
        {rules.hasIssuedTickets ? (
          <Card className="mb-7 flex-row items-start gap-3 p-4">
            <TriangleAlert className="mt-px h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-[13px] leading-relaxed text-pretty text-muted-foreground">
              People already hold tickets. Changing the date or the venue posts
              an update to the event chat automatically so nobody turns up to
              the wrong place.
            </p>
          </Card>
        ) : null}

        <div className="flex flex-col gap-5 sm:gap-7">
          <Section title="Basics">
            <div className="flex flex-col gap-5">
              <label className="block">
                <SectionLabel>Event name</SectionLabel>
                <OrganizerField
                  value={value.name}
                  maxLength={140}
                  onChange={(input) => set("name", input.target.value)}
                />
              </label>

              <div>
                <SectionLabel>Cover image</SectionLabel>
                <ImageUpload
                  value={value.imageUrl}
                  onChange={(url) => set("imageUrl", url)}
                />
              </div>

              <label className="block">
                <SectionLabel>Description</SectionLabel>
                <OrganizerTextarea
                  value={value.description}
                  rows={5}
                  maxLength={1200}
                  onChange={(input) => set("description", input.target.value)}
                />
              </label>

              <div>
                <SectionLabel>Categories</SectionLabel>
                <CategoryPicker
                  value={value.categoryIds}
                  onChange={(next) => set("categoryIds", next)}
                />
              </div>
            </div>
          </Section>

          <Section
            title="Where"
            hint={
              rules.hasIssuedTickets
                ? "Moving the venue notifies everyone holding a ticket."
                : undefined
            }
          >
            <LocationPicker
              value={value.location}
              onChange={(next) => set("location", next)}
            />
            <div className="mt-5 flex flex-col gap-5">
              <label className="block">
                <SectionLabel>Address</SectionLabel>
                <OrganizerField
                  value={value.location.address}
                  maxLength={300}
                  onChange={(input) =>
                    set("location", {
                      ...value.location,
                      address: input.target.value,
                    })
                  }
                />
              </label>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <SectionLabel>Country</SectionLabel>
                  <Select
                    label="Country"
                    value={value.location.country}
                    onChange={(next) =>
                      set("location", {
                        ...value.location,
                        country: next,
                        state: "",
                      })
                    }
                    options={[...COUNTRIES]}
                  />
                </div>
                <div className="flex-1">
                  <SectionLabel>
                    {subdivisionLabel(value.location.country)}
                  </SectionLabel>
                  {subdivisions ? (
                    <Select
                      label={subdivisionLabel(value.location.country)}
                      value={value.location.state}
                      onChange={(next) =>
                        set("location", { ...value.location, state: next })
                      }
                      options={subdivisions}
                    />
                  ) : (
                    <OrganizerField
                      value={value.location.state}
                      onChange={(input) =>
                        set("location", {
                          ...value.location,
                          state: input.target.value,
                        })
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </Section>

          <Section
            title="When"
            hint={
              rules.hasIssuedTickets
                ? "Moving the date notifies everyone holding a ticket."
                : undefined
            }
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <label className="flex-1">
                <SectionLabel>Starts</SectionLabel>
                <OrganizerField
                  type="datetime-local"
                  value={value.startsAt}
                  onChange={(input) => set("startsAt", input.target.value)}
                />
              </label>
              <label className="flex-1">
                <SectionLabel>Ends</SectionLabel>
                <OrganizerField
                  type="datetime-local"
                  value={value.endsAt}
                  onChange={(input) => set("endsAt", input.target.value)}
                />
              </label>
            </div>
          </Section>

          <Section title="Tickets &amp; pricing" locked={pricingLock}>
            {tiers.length > 0 ? (
              <div className="flex flex-col gap-2">
                {tiers.map((tier) => (
                  <Card
                    key={tier._id}
                    className="flex-row items-center gap-3 px-4 py-3.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {tier.name}
                    </span>
                    <AmountField
                      value={tier.quantity}
                      onValueChange={() => undefined}
                      disabled
                      aria-label={`${tier.name} tickets`}
                      className="h-10 w-[100px] shrink-0 text-right"
                    />
                    <AmountField
                      value={tier.priceNaira}
                      onValueChange={() => undefined}
                      disabled
                      aria-label={`${tier.name} price`}
                      className="h-10 w-[120px] shrink-0 text-right"
                    />
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground">
                This event has no tiers. It sells at a single price.
              </p>
            )}
          </Section>

          <Section
            title="Visibility"
            hint={
              event.status === "draft"
                ? "Drafts are invisible to everyone but you."
                : rules.hasIssuedTickets
                  ? "People hold tickets, so this event stays public."
                  : "Live on Vera and open for ticket sales."
            }
          >
            <Card className="flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold">
                    {event.status === "draft" ? "Draft" : "Published"}
                  </span>
                  <EventStatusBadge event={event} />
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-pretty text-muted-foreground">
                  {event.status === "draft"
                    ? "Publishing puts it on sale immediately."
                    : rules.hasIssuedTickets
                      ? "Unpublishing would hide it from people who already bought. Cancel instead if it is not happening."
                      : "Reverting to a draft takes it off sale and hides it."}
                </p>
              </div>
              <Button
                size="sm"
                variant={event.status === "draft" ? "default" : "outline"}
                className="shrink-0"
                disabled={
                  event.status === "published" && rules.hasIssuedTickets
                }
                loading={updateEvent.isPending}
                onClick={async () => {
                  const next = event.status === "draft" ? "published" : "draft";

                  try {
                    await updateEvent.mutateAsync({ status: next });
                    toast.success(
                      next === "published"
                        ? "Event published."
                        : "Reverted to a draft",
                    );
                  } catch (error) {
                    toast.error(
                      getApiErrorMessage(error, "Couldn't change visibility"),
                    );
                  }
                }}
              >
                {event.status === "draft" ? "Publish event" : "Revert to draft"}
              </Button>
            </Card>
          </Section>

          <Section
            title="Danger zone"
            hint={
              rules.canDelete
                ? "Nobody holds a ticket yet, so this event can still be removed outright."
                : undefined
            }
          >
            <Card className="flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">
                  {rules.canDelete ? "Delete this event" : "Cancel this event"}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-pretty text-muted-foreground">
                  {rules.canDelete
                    ? "Removes it from Vera entirely. This cannot be undone."
                    : `Refunds all ${issuedTickets.toLocaleString("en-NG")} issued ${issuedTickets === 1 ? "ticket" : "tickets"} and tells every holder. Events with tickets cannot be deleted, only cancelled.`}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 border-destructive/60 text-destructive hover:bg-destructive/10"
                onClick={() =>
                  rules.canDelete
                    ? setConfirmDelete(true)
                    : setConfirmCancel(true)
                }
              >
                {rules.canDelete ? "Delete event" : "Cancel and refund"}
              </Button>
            </Card>
          </Section>
        </div>
      </div>

      <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] mt-8 border-t border-border bg-background/95 px-4 py-3.5 backdrop-blur-sm sm:px-6 lg:bottom-0 lg:px-8">
        <div className="flex items-end justify-end gap-2.5 ">
          <Button
            variant="link"
            onClick={handleDiscard}
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Discard
          </Button>
          <Button
            loading={updateEvent.isPending || notify.isPending}
            disabled={value.name.trim().length < 2}
            onClick={save}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
