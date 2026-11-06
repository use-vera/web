"use client";

import { formatNairaAmount } from "@/lib/format-currency";
import { usePublicVendor } from "@/lib/hooks/use-event-vendors";
import EventPoster from "@/components/vera/event-poster";
import { UtensilsCrossed } from "lucide-react";

/**
 * A vendor's page, as anyone can see it: who they are and what is on sale.
 *
 * The backend serves only available items here, so an organizer sizing a
 * vendor up sees what an attendee would, not what is switched off.
 */
const VendorPublicPage = ({ slug }: { slug: string }) => {
  const vendorQuery = usePublicVendor(slug);
  const menu = vendorQuery.data;

  if (vendorQuery.isPending) {
    return (
      <main className="mx-auto w-full max-w-[1240px] px-[clamp(16px,4vw,40px)] pt-[clamp(16px,3vw,40px)] pb-24">
        <div className="min-h-[clamp(220px,26vw,340px)] animate-pulse rounded-[36px] bg-muted" />
      </main>
    );
  }

  if (vendorQuery.isError || !menu) {
    return (
      <main className="mx-auto w-full max-w-[1240px] px-[clamp(16px,4vw,40px)] py-24">
        <h1 style={{ lineHeight: 0.95 }} className="text-[clamp(40px,5vw,64px)] font-extrabold tracking-[-0.045em] text-foreground">
          we couldn&apos;t find <span className="text-primary">that vendor.</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          The link may be old, or the vendor may no longer be selling on Vera.
        </p>
      </main>
    );
  }

  const vendor = menu.vendor;

  return (
    <main className="mx-auto w-full max-w-[1240px] px-[clamp(16px,4vw,40px)] pt-[clamp(16px,3vw,40px)] pb-24">
      {/* The vendor's poster: their colour, their name set big, their logo if they have one. */}
      <EventPoster
        seed={vendor.businessName}
        title={vendor.businessName}
        tag={vendor.categoryLabels.join(" · ") || undefined}
        className="min-h-[clamp(220px,26vw,340px)] rounded-[36px]"
        titleClassName="text-[clamp(48px,8vw,120px)] tracking-[-0.055em]"
        badge={
          vendor.logoUrl ? (
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={vendor.logoUrl} alt="" className="h-full w-full object-cover" />
            </span>
          ) : null
        }
      />

      <header className="flex flex-col gap-2.5 pt-[clamp(24px,4vw,44px)]">
        <h1 style={{ lineHeight: 0.95 }} className="text-[clamp(40px,5vw,64px)] font-extrabold tracking-[-0.045em] text-foreground">
          {vendor.businessName}
        </h1>
        <p className="text-base text-muted-foreground">
          {[
            vendor.categoryLabels.join(", "),
            vendor.city,
            vendor.ratingsCount > 0
              ? `★ ${vendor.averageRating} from ${vendor.ratingsCount} ${vendor.ratingsCount === 1 ? "rating" : "ratings"}`
              : "New on Vera",
            vendor.eventsWorkedCount > 0
              ? `${vendor.eventsWorkedCount} ${vendor.eventsWorkedCount === 1 ? "event" : "events"} worked`
              : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      {menu.sections.length === 0 ? (
        <div className="mt-10 flex flex-col gap-2 border-y border-border py-10">
          <p style={{ lineHeight: 1 }} className="text-[28px] font-extrabold tracking-[-0.03em] text-foreground">
            nothing on sale <span className="text-primary">right now.</span>
          </p>
          <p className="text-base text-muted-foreground">
            This vendor has not put anything on their menu yet.
          </p>
        </div>
      ) : null}

      <div className="mt-12 flex flex-col gap-12">
        {menu.sections.map((section) => (
          <section key={section._id ?? "default"}>
            <h2 style={{ lineHeight: 1 }} className="text-[28px] font-extrabold tracking-[-0.03em] text-foreground">
              {section.name}
            </h2>

            <ul className="mt-4 divide-y divide-border border-y border-border">
              {section.items.map((item) => (
                <li key={item._id} className="flex items-center gap-4 py-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold text-foreground">
                      {item.name}
                    </span>
                    {item.description ? (
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {item.description}
                      </span>
                    ) : null}
                  </span>

                  <span className="text-base font-bold tabular-nums text-foreground">
                    {formatNairaAmount(item.priceNaira)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 text-base text-muted-foreground">
        Ordering happens in the Vera app, at the event itself.
      </p>
    </main>
  );
};

export default VendorPublicPage;
