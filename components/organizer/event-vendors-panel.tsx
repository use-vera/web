"use client";

import { StatStrip } from "@/components/organizer/organizer-primitives";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Switch from "@/components/ui/switch";
import { formatNairaAmount } from "@/lib/format-currency";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import {
  useDecideVendorApplication,
  useEventVendors,
  useInviteVendor,
  useRemoveEventVendor,
  useUpdateEventVendorSettings,
  useVendorDirectory,
} from "@/lib/hooks/use-event-vendors";
import { type VendorBooking } from "@/lib/types/vendor";
import { cn } from "@/lib/utils";
import { Loader2, Search, Star, Store, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_LABEL: Record<VendorBooking["status"], string> = {
  confirmed: "Confirmed",
  invited: "Invited",
  applied: "Applied",
  declined: "Declined",
  rejected: "Not accepted",
  cancelled: "Removed",
};

const StatusPill = ({ status }: { status: VendorBooking["status"] }) => (
  <span
    className={cn(
      "rounded-full px-2.5 py-1 text-xs font-bold",
      status === "confirmed"
        ? "bg-accent text-accent-foreground"
        : status === "applied" || status === "invited"
          ? "bg-secondary text-foreground"
          : "bg-muted text-muted-foreground",
    )}
  >
    {STATUS_LABEL[status]}
  </span>
);

const VendorRow = ({
  booking,
  eventId,
}: {
  booking: VendorBooking;
  eventId: string;
}) => {
  const decide = useDecideVendorApplication(eventId);
  const remove = useRemoveEventVendor(eventId);
  const vendor = booking.vendor;

  return (
    <li className="flex flex-wrap items-center gap-4 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary">
        {vendor?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.logoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Store className="h-4 w-4 text-muted-foreground" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold text-foreground">
          {vendor?.businessName ?? "Vendor"}
        </span>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          {vendor?.ratingsCount ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-amber-500" />
              {vendor.averageRating}
            </span>
          ) : (
            <span>New on Vera</span>
          )}
          {booking.terms.stallLabel ? (
            <span>· {booking.terms.stallLabel}</span>
          ) : null}
          {booking.terms.stallFeeNaira ? (
            <span>
              · {formatNairaAmount(booking.terms.stallFeeNaira)} stall
            </span>
          ) : null}
        </span>
      </span>

      <StatusPill status={booking.status} />

      {booking.status === "applied" ? (
        <span className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            loading={decide.isPending}
            onClick={() =>
              decide.mutate(
                { bookingId: booking._id, accept: false },
                { onSuccess: () => toast.success("Application declined") },
              )
            }
          >
            Decline
          </Button>
          <Button
            variant="ink"
            size="sm"
            loading={decide.isPending}
            onClick={() =>
              decide.mutate(
                { bookingId: booking._id, accept: true },
                {
                  onSuccess: () =>
                    toast.success("Accepted. They get the terms to confirm."),
                },
              )
            }
          >
            Accept
          </Button>
        </span>
      ) : null}

      {booking.status === "confirmed" || booking.status === "invited" ? (
        <button
          type="button"
          aria-label={`Remove ${vendor?.businessName ?? "vendor"}`}
          onClick={() =>
            remove.mutate(booking._id, {
              onSuccess: () => toast.success("Vendor removed"),
            })
          }
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </li>
  );
};

const InviteSearch = ({ eventId }: { eventId: string }) => {
  const [search, setSearch] = useState("");
  /* Where this vendor will stand. Decided when you invite them, because that
     is when you are looking at the floor plan. */
  const [stallLabel, setStallLabel] = useState("");
  const debounced = useDebouncedValue(search, 300);
  const directory = useVendorDirectory({ search: debounced });
  const invite = useInviteVendor(eventId);

  return (
    <div className="flex flex-col gap-3 rounded-[28px] border-[1.5px] border-border p-5">
      <div>
        <h2 className="text-[17px] font-bold">Invite a vendor</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          They see your terms in full and choose whether to accept.
        </p>
      </div>

      <div className="flex items-center gap-2.5 rounded-full border-[1.5px] border-border px-4 transition-colors focus-within:border-foreground">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search vendors by name"
          className="h-12 flex-1 bg-transparent text-[15px] text-foreground outline-none"
        />
        {directory.isFetching ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <label className="flex flex-col gap-2 text-sm font-bold text-foreground">
        Stall for this invite (optional)
        <input
          value={stallLabel}
          onChange={(event) => setStallLabel(event.target.value)}
          placeholder="Stall 7, by the main stage"
          maxLength={80}
          className="h-12 rounded-2xl border-[1.5px] border-border bg-transparent px-4 text-[15px] font-medium text-foreground outline-none focus-visible:border-foreground"
        />
      </label>

      <ul className="flex flex-col divide-y divide-border">
        {(directory.data ?? []).slice(0, 6).map((vendor) => (
          <li key={vendor._id} className="flex items-center gap-3 py-2.5">
            <span className="min-w-0 flex-1">
              <Link
                href={`/vendors/${vendor.slug}`}
                target="_blank"
                className="block truncate text-sm font-semibold text-foreground underline-offset-4 hover:underline"
              >
                {vendor.businessName}
              </Link>
              <span className="block truncate text-xs text-muted-foreground">
                {vendor.categoryLabels.join(", ")}
                {vendor.city ? ` · ${vendor.city}` : ""}
              </span>
            </span>
            <Button
              variant="ink"
              size="sm"
              loading={invite.isPending}
              onClick={() =>
                invite.mutate(
                  {
                    vendorId: vendor._id,
                    stallLabel: stallLabel.trim() || undefined,
                  },
                  {
                    onSuccess: () => toast.success("Invitation sent"),
                    onError: () =>
                      toast.error(
                        "Couldn't invite them. They may already be on this event.",
                      ),
                  },
                )
              }
            >
              Invite
            </Button>
          </li>
        ))}

        {directory.data?.length === 0 ? (
          <li className="py-3 text-xs text-muted-foreground">
            No vendors matched. They may not be on Vera yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
};

/** The organizer's Vendors tab: terms, applications to answer, who is coming. */
const EventVendorsPanel = ({ eventId }: { eventId: string }) => {
  const vendorsQuery = useEventVendors(eventId);
  const updateSettings = useUpdateEventVendorSettings(eventId);

  const data = vendorsQuery.data;
  const settings = data?.vendorSettings;

  const [stallFee, setStallFee] = useState<string | null>(null);
  const [spots, setSpots] = useState<string | null>(null);

  if (vendorsQuery.isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[118px] rounded-[24px]" />
          ))}
        </div>
        <Skeleton className="h-[240px] rounded-[28px]" />
      </div>
    );
  }

  const waiting = (data?.items ?? []).filter(
    (item) => item.status === "applied",
  );
  const active = (data?.items ?? []).filter((item) =>
    ["confirmed", "invited"].includes(item.status),
  );
  const closed = (data?.items ?? []).filter((item) =>
    ["declined", "rejected", "cancelled"].includes(item.status),
  );

  return (
    <div className="flex flex-col gap-5">
      <StatStrip
        cells={[
          {
            label: "Confirmed",
            value: data?.counts.confirmed ?? 0,
            note: "coming to sell",
          },
          {
            label: "Invited",
            value: data?.counts.invited ?? 0,
            note: "yet to answer",
          },
          {
            label: "Applications",
            value: data?.counts.applied ?? 0,
            note: "waiting for you",
          },
          {
            label: "Spots",
            value: settings?.spots || "No limit",
            note: "vendor places",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-5">
          {waiting.length > 0 ? (
            <section>
              <h2 className="mb-3 text-[17px] font-bold">Waiting for you</h2>
              <ul className="divide-y-[1.5px] divide-border overflow-hidden rounded-[28px] border-[1.5px] border-border">
                {waiting.map((booking) => (
                  <VendorRow
                    key={booking._id}
                    booking={booking}
                    eventId={eventId}
                  />
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-[17px] font-bold">Vendors</h2>
            {active.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="text-sm font-semibold text-foreground">
                  No vendors yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Invite one, or switch on applications so they can come to you.
                </p>
              </div>
            ) : (
              <ul className="divide-y-[1.5px] divide-border overflow-hidden rounded-[28px] border-[1.5px] border-border">
                {active.map((booking) => (
                  <VendorRow
                    key={booking._id}
                    booking={booking}
                    eventId={eventId}
                  />
                ))}
              </ul>
            )}
          </section>

          {closed.length > 0 ? (
            <section>
              <h2 className="mb-3 text-[17px] font-bold">Closed</h2>
              <ul className="divide-y-[1.5px] divide-border overflow-hidden rounded-[28px] border-[1.5px] border-border opacity-70">
                {closed.map((booking) => (
                  <VendorRow
                    key={booking._id}
                    booking={booking}
                    eventId={eventId}
                  />
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-[28px] border-[1.5px] border-border p-5">
            <div>
              <h2 className="text-[17px] font-bold">Your terms</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                The stall fee is all you charge a vendor. Deals already agreed
                do not change.
              </p>
            </div>

            <label className="flex flex-col gap-2 text-sm font-bold text-foreground">
              Stall fee (₦)
              <input
                value={stallFee ?? String(settings?.stallFeeNaira ?? 0)}
                onChange={(event) =>
                  setStallFee(event.target.value.replace(/[^0-9]/g, ""))
                }
                onBlur={() =>
                  stallFee !== null &&
                  updateSettings.mutate({ stallFeeNaira: Number(stallFee) })
                }
                inputMode="numeric"
                className="h-12 rounded-2xl border-[1.5px] border-border bg-transparent px-4 text-[15px] text-foreground outline-none focus-visible:border-foreground"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-bold text-foreground">
              Vendor spots
              <input
                value={spots ?? String(settings?.spots ?? 0)}
                onChange={(event) =>
                  setSpots(event.target.value.replace(/[^0-9]/g, ""))
                }
                onBlur={() =>
                  spots !== null &&
                  updateSettings.mutate({ spots: Number(spots) })
                }
                inputMode="numeric"
                className="h-12 rounded-2xl border-[1.5px] border-border bg-transparent px-4 text-[15px] text-foreground outline-none focus-visible:border-foreground"
              />
              <span className="text-[13px] font-medium text-muted-foreground">
                0 means no limit. Confirmed vendors stop at this number.
              </span>
            </label>

            <div className="flex items-center gap-3 border-t-[1.5px] border-dashed border-border pt-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-card-foreground">
                  Take applications
                </p>
                <p className="text-xs text-muted-foreground">
                  Shows this event to vendors on Vera
                </p>
              </div>
              <Switch
                checked={Boolean(settings?.acceptingApplications)}
                disabled={updateSettings.isPending}
                onCheckedChange={(checked) =>
                  updateSettings.mutate({ acceptingApplications: checked })
                }
                aria-label="Take vendor applications"
              />
            </div>
          </div>

          <InviteSearch eventId={eventId} />
        </div>
      </div>
    </div>
  );
};

export default EventVendorsPanel;
