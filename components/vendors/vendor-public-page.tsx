"use client";

import { formatNairaAmount } from "@/lib/format-currency";
import { usePublicVendor } from "@/lib/hooks/use-event-vendors";
import { Store, UtensilsCrossed } from "lucide-react";

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
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (vendorQuery.isError || !menu) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          We couldn&apos;t find that vendor
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The link may be old, or the vendor may no longer be selling on Vera.
        </p>
      </main>
    );
  }

  const vendor = menu.vendor;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="flex flex-wrap items-center gap-5">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary">
          {vendor.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendor.logoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Store className="h-7 w-7 text-muted-foreground" />
          )}
        </span>

        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-[-0.01em] text-foreground">
            {vendor.businessName}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {vendor.categoryLabels.join(" · ")}
            {vendor.city ? ` · ${vendor.city}` : ""}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {vendor.ratingsCount > 0
              ? `★ ${vendor.averageRating} from ${vendor.ratingsCount} ${
                  vendor.ratingsCount === 1 ? "rating" : "ratings"
                }`
              : "New on Vera"}
            {vendor.eventsWorkedCount > 0
              ? ` · ${vendor.eventsWorkedCount} ${
                  vendor.eventsWorkedCount === 1 ? "event" : "events"
                } worked`
              : ""}
          </p>
        </div>
      </header>

      {menu.sections.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm font-semibold text-foreground">
            Nothing on sale right now
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This vendor has not put anything on their menu yet.
          </p>
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-8">
        {menu.sections.map((section) => (
          <section key={section._id ?? "default"}>
            <h2 className="text-xs font-bold uppercase text-muted-foreground">
              {section.name}
            </h2>

            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {section.items.map((item) => (
                <li key={item._id} className="flex items-center gap-4 p-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
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
                    <span className="block text-sm font-semibold text-card-foreground">
                      {item.name}
                    </span>
                    {item.description ? (
                      <span className="block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    ) : null}
                  </span>

                  <span className="text-sm font-bold tabular-nums text-card-foreground">
                    {formatNairaAmount(item.priceNaira)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Ordering happens in the Vera app, at the event itself.
      </p>
    </main>
  );
};

export default VendorPublicPage;
