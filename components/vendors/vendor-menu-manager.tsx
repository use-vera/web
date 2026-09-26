"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import Button from "@/components/ui/button";
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
import { ImageOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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

  if (menuQuery.isPending) {
    return (
      // <p className="p-6 text-sm text-muted-foreground">Loading your menu…</p>

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Loading your menu...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 ">
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Switch an item off the moment it runs out. Buyers stop seeing it
            straight away.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {menu?.vendor.slug ? (
            <a
              href={`/vendors/${menu.vendor.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View your page
            </a>
          ) : null}
          <Button
            onClick={() => {
              setEditing(null);
              setAdding(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>
      </div>

      {adding || editing ? (
        <div className="rounded-2xl border border-border bg-card p-6 max-w-3xl">
          <h2 className="mb-5 text-lg font-bold text-card-foreground">
            {editing ? `Edit ${editing.name}` : "Add an item"}
          </h2>
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
                  await updateItem.mutateAsync({
                    itemId: editing._id,
                    payload,
                  });
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
      ) : null}

      

      {menu && menu.itemCount === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm font-semibold text-foreground">
            Your menu is empty
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add what you sell and it shows up for attendees at your next event.
          </p>
        </div>
      ) : null}

      {(menu?.sections ?? []).map((section) => (
        <section key={section._id ?? "default"} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-bold uppercase text-muted-foreground">
              {section.name}
            </h2>
            <span className="text-xs  text-muted-foreground">
              {section.items.length}{" "}
              {section.items.length === 1 ? "item" : "items"}
            </span>
            {section._id ? (
              <button
                type="button"
                onClick={() =>
                  setConfirmSection({ id: section._id!, name: section.name })
                }
                className="ml-auto text-xs font-semibold text-muted-foreground hover:text-destructive"
              >
                Remove section
              </button>
            ) : null}
          </div>

          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {section.items.map((item) => (
              <li key={item._id} className="flex items-center gap-4 p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-base font-semibold",
                      item.available
                        ? "text-card-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.name}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {item.categoryLabel}
                    {item.stock === null ? "" : ` · ${item.stock} left`}
                  </span>
                </span>

                <span className="text-base font-bold tabular-nums text-card-foreground">
                  {formatNairaAmount(item.priceNaira)}
                </span>

                <AvailabilitySwitch item={item} />

                <button
                  type="button"
                  aria-label={`Edit ${item.name}`}
                  onClick={() => {
                    setAdding(false);
                    setEditing(item);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => setConfirmDelete(item)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default VendorMenuManager;
