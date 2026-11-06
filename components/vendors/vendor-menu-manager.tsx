"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState, ErrorState, PageHeader, Panel, PanelHeader, StatStrip } from "@/components/organizer/organizer-primitives";
import Button, { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { POSTER_TONES, toneFor } from "@/components/vera/event-poster";
import Switch from "@/components/ui/switch";
import VendorItemForm from "@/components/vendors/vendor-item-form";
import { formatNairaAmount } from "@/lib/format-currency";
import {
  useCreateVendorItem,
  useDeleteVendorItem,
  useDeleteVendorSection,
  useMyVendorMenu,
  useUpdateVendorItem,
} from "@/lib/hooks/use-vendor";
import { type VendorItem } from "@/lib/types/vendor";
import { cn } from "@/lib/utils";
import { ExternalLink, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AvailabilitySwitch = ({ item }: { item: VendorItem }) => {
  const updateItem = useUpdateVendorItem();

  return (
    <Switch
      checked={item.available}
      aria-label={`${item.name} on sale`}
      disabled={updateItem.isPending}
      onCheckedChange={(checked) =>
        updateItem.mutate({ itemId: item._id, payload: { available: checked } })
      }
    />
  );
};

/** The item's photo, or its first letter on a poster colour. */
const ItemThumb = ({ item }: { item: VendorItem }) => {
  const colours = POSTER_TONES[toneFor(item._id)];

  return (
    <span
      aria-hidden="true"
      className={cn("flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[16px] text-xl font-extrabold", !item.available && "opacity-55 grayscale")}
      style={{ backgroundColor: colours.bg, color: colours.fg }}
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        item.name.charAt(0).toUpperCase()
      )}
    </span>
  );
};

/**
 * The vendor's own view of their menu: everything they have, including what is
 * switched off. The buyer-facing menu drops those; this one must not, because
 * this is where they get switched back on.
 */
const VendorMenuManager = () => {
  const menuQuery = useMyVendorMenu();
  const deleteItem = useDeleteVendorItem();
  const deleteSection = useDeleteVendorSection();

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<VendorItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<VendorItem | null>(null);
  const [confirmSection, setConfirmSection] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const updateItem = useUpdateVendorItem();
  const createItem = useCreateVendorItem();
  const menu = menuQuery.data;
  const sections = menu?.vendor.sections ?? [];

  const allItems = (menu?.sections ?? []).flatMap((section) => section.items);
  const onSale = allItems.filter((item) => item.available).length;

  const openAdd = () => {
    setEditing(null);
    setAdding(true);
  };

  return (
    <div className="flex flex-col pb-10">
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title={`Remove ${confirmDelete?.name ?? "this item"}?`}
        description="It disappears from your menu. Orders already placed for it are not affected."
        confirmLabel="Remove item"
        cancelLabel="Keep it"
        loading={deleteItem.isPending}
        onConfirm={() => {
          if (!confirmDelete) {
            return;
          }

          deleteItem.mutate(confirmDelete._id, {
            onSuccess: () => setConfirmDelete(null),
          });
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmSection)}
        onOpenChange={(open) => !open && setConfirmSection(null)}
        title={`Remove the ${confirmSection?.name ?? ""} section?`}
        description="The items in it stay on your menu, under your default heading."
        confirmLabel="Remove section"
        cancelLabel="Keep it"
        loading={deleteSection.isPending}
        onConfirm={() => {
          if (!confirmSection) {
            return;
          }

          deleteSection.mutate(confirmSection.id, {
            onSuccess: () => setConfirmSection(null),
          });
        }}
      />

      <PageHeader
        lead="your"
        accent="menu."
        description="Switch an item off the moment it runs out. Buyers stop seeing it straight away."
        actions={
          <>
            {menu?.vendor.slug ? (
              <a href={`/vendors/${menu.vendor.slug}`} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "line", size: "sm" })}>
                <ExternalLink className="h-4 w-4" />
                Your page
              </a>
            ) : null}
            <Button variant="ink" size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </>
        }
      />

      {menuQuery.isPending ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[108px] rounded-[24px]" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-[28px]" />
        </div>
      ) : null}

      {menuQuery.isError ? (
        <Panel>
          <ErrorState message="Couldn't load your menu." onRetry={() => menuQuery.refetch()} />
        </Panel>
      ) : null}

      {menu && menu.itemCount > 0 ? (
        <StatStrip
          cells={[
            { label: "On sale", value: onSale.toLocaleString("en-NG"), note: "buyers can order these" },
            { label: "Switched off", value: (allItems.length - onSale).toLocaleString("en-NG"), note: "hidden from buyers" },
            { label: "Sections", value: sections.length.toLocaleString("en-NG"), note: "headings on your menu" },
          ]}
        />
      ) : null}

      {adding || editing ? (
        <Panel className="mt-6 max-w-3xl">
          <PanelHeader
            title={editing ? `Edit ${editing.name}` : "Add an item"}
            description={editing ? "Changes show on your menu as soon as you save." : "It goes on sale as soon as you add it."}
          />
          <div className="px-5 pb-6 sm:px-6">
            <VendorItemForm
              key={editing?._id ?? "new"}
              sections={sections}
              item={editing ?? undefined}
              pending={updateItem.isPending || createItem.isPending}
              submitLabel={editing ? "Save changes" : "Add item"}
              onCancel={() => {
                setAdding(false);
                setEditing(null);
              }}
              onSubmit={async (payload) => {
                try {
                  if (editing) {
                    await updateItem.mutateAsync({ itemId: editing._id, payload });
                    toast.success("Item updated");
                  } else {
                    await createItem.mutateAsync(payload);
                    toast.success("Item added");
                  }

                  setEditing(null);
                  setAdding(false);
                } catch {
                  toast.error("Couldn't save that item.");
                }
              }}
            />
          </div>
        </Panel>
      ) : null}

      {menu && menu.itemCount === 0 && !adding ? (
        <Panel className="mt-2">
          <EmptyState
            icon={<UtensilsCrossed className="h-6 w-6" />}
            title="your menu is empty"
            description="Add what you sell and it shows up for attendees at your next event."
            action={
              <Button variant="ink" size="sm" onClick={openAdd}>
                <Plus className="h-4 w-4" />
                Add your first item
              </Button>
            }
          />
        </Panel>
      ) : null}

      {(menu?.sections ?? [])
        .filter((section) => section.items.length > 0 || section._id)
        .map((section) => (
          <section key={section._id ?? "default"} className="mt-8 flex flex-col gap-3">
            <div className="flex items-end gap-3 px-1">
              <h2 className="text-[22px] leading-tight font-extrabold tracking-[-0.03em]">{section.name}</h2>
              <span className="pb-0.5 text-[13px] font-semibold text-muted-foreground tabular-nums">
                {section.items.length} {section.items.length === 1 ? "item" : "items"}
              </span>
              {section._id ? (
                <button
                  type="button"
                  onClick={() => setConfirmSection({ id: section._id!, name: section.name })}
                  className="ml-auto cursor-pointer pb-0.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-destructive"
                >
                  Remove section
                </button>
              ) : null}
            </div>

            {section.items.length === 0 ? (
              <p className="rounded-[22px] border-[1.5px] border-dashed border-border px-5 py-6 text-center text-[13px] font-semibold text-muted-foreground">
                Nothing in this section yet. Pick it when you add or edit an item.
              </p>
            ) : (
              <Panel>
                <ul className="divide-y-[1.5px] divide-border">
                  {section.items.map((item) => (
                    <li key={item._id} className="flex items-center gap-3 p-3 sm:gap-4 sm:pr-4">
                      <ItemThumb item={item} />

                      <span className={cn("flex min-w-0 flex-1 flex-col gap-0.5", !item.available && "opacity-55")}>
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-base font-bold">{item.name}</span>
                          {item.ageRestricted ? (
                            <span className="shrink-0 rounded-full border-[1.5px] border-current px-1.5 text-[11px] font-bold">18+</span>
                          ) : null}
                        </span>
                        <span className="truncate text-[13px] text-muted-foreground">
                          {item.categoryLabel}
                          {item.stock === null ? "" : ` · ${item.stock} left`}
                          {item.available ? "" : " · switched off"}
                        </span>
                      </span>

                      <span className={cn("text-base font-extrabold tracking-[-0.02em] tabular-nums", !item.available && "opacity-55")}>
                        {formatNairaAmount(item.priceNaira)}
                      </span>

                      <AvailabilitySwitch item={item} />

                      <span className="flex shrink-0 items-center">
                        <button
                          type="button"
                          aria-label={`Edit ${item.name}`}
                          onClick={() => {
                            setAdding(false);
                            setEditing(item);
                          }}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => setConfirmDelete(item)}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </section>
        ))}
    </div>
  );
};

export default VendorMenuManager;
