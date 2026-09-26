"use client";

import AuthField from "@/components/auth/auth-field";
import Button from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import Switch from "@/components/ui/switch";
import VendorImageInput from "@/components/vendors/vendor-image-input";
import {
  useAddVendorSection,
  useVendorCategories,
} from "@/lib/hooks/use-vendor";
import {
  type CreateVendorItemPayload,
  type VendorCategoryKey,
  type VendorItem,
  type VendorSection,
} from "@/lib/types/vendor";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/* The one id the section dropdown owns itself: everything else in that list is
   a real section. */
const NO_SECTION = "__none__";

interface VendorItemFormProps {
  sections: VendorSection[];
  /** Editing an existing item, rather than adding a new one. */
  item?: VendorItem;
  onSubmit: (payload: CreateVendorItemPayload) => Promise<unknown>;
  onCancel?: () => void;
  submitLabel?: string;
  pending?: boolean;
}

const VendorItemForm = ({
  sections,
  item,
  onSubmit,
  onCancel,
  submitLabel = "Save item",
  pending = false,
}: VendorItemFormProps) => {
  const categoriesQuery = useVendorCategories();
  const addSection = useAddVendorSection();

  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.priceNaira) : "");
  const [stock, setStock] = useState(
    item?.stock === null || item?.stock === undefined ? "" : String(item.stock),
  );
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [category, setCategory] = useState<VendorCategoryKey | null>(
    item?.category ?? null,
  );
  const [sectionId, setSectionId] = useState<string>(
    item?.sectionId ?? NO_SECTION,
  );
  const [ageRestricted, setAgeRestricted] = useState(
    item?.ageRestricted ?? false,
  );
  const [newSection, setNewSection] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  const categoryOptions = (categoriesQuery.data ?? []).map((option) => ({
    value: option.key,
    label: option.label,
  }));

  const sectionOptions = [
    { value: NO_SECTION, label: "No section" },
    ...sections.map((section) => ({
      value: section._id,
      label: section.name,
    })),
  ];

  const handleAddSection = async () => {
    const trimmed = newSection.trim();

    if (!trimmed) {
      return;
    }

    try {
      const vendor = await addSection.mutateAsync(trimmed);
      /* Select what they just made: they created it in order to use it. */
      const created = vendor.sections.find(
        (section) => section.name.toLowerCase() === trimmed.toLowerCase(),
      );
      setSectionId(created?._id ?? NO_SECTION);
      setNewSection("");
      setAddingSection(false);
    } catch {
      toast.error("Couldn't add that section. It may already exist.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!category) {
      toast.error("Pick a category for this item.");
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      imageUrl,
      priceNaira: Number(price || 0),
      category,
      sectionId: sectionId === NO_SECTION ? null : sectionId,
      ageRestricted,
      stock: stock.trim() === "" ? null : Number(stock),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <VendorImageInput
        value={imageUrl}
        onChange={setImageUrl}
        label="Photo of this item"
      />

      <AuthField
        label="Item name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Jollof rice & chicken"
        required
        minLength={1}
        maxLength={120}
      />

      <AuthField
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Party jollof, fried plantain, grilled chicken"
        maxLength={400}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AuthField
          label="Price (₦)"
          value={price}
          onChange={(event) =>
            setPrice(event.target.value.replace(/[^0-9]/g, ""))
          }
          inputMode="numeric"
          placeholder="4500"
          required
        />
        <AuthField
          label="How many tonight"
          value={stock}
          onChange={(event) =>
            setStock(event.target.value.replace(/[^0-9]/g, ""))
          }
          inputMode="numeric"
          placeholder="Leave empty for no limit"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="item-category"
            className="text-sm font-semibold text-foreground"
          >
            Category
          </label>
          <Select
            id="item-category"
            value={category}
            onValueChange={(value) =>
              setCategory((value as VendorCategoryKey) ?? null)
            }
            options={categoryOptions}
            placeholder="Choose a category"
          />
          <p className="text-xs text-muted-foreground">
            Vera&apos;s list. How attendees filter and organizers find you.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="item-section"
            className="text-sm font-semibold text-foreground"
          >
            Section on your menu
          </label>

          {addingSection ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newSection}
                onChange={(event) => setNewSection(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleAddSection();
                  }

                  if (event.key === "Escape") {
                    setAddingSection(false);
                    setNewSection("");
                  }
                }}
                placeholder="Section name"
                maxLength={60}
                className="h-12 flex-1 rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none focus-visible:border-primary"
              />
              <Button
                type="button"
                size="sm"
                loading={addSection.isPending}
                onClick={() => void handleAddSection()}
              >
                Add
              </Button>
              <button
                type="button"
                aria-label="Cancel new section"
                onClick={() => {
                  setAddingSection(false);
                  setNewSection("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Select
                id="item-section"
                value={sectionId}
                onValueChange={(value) => setSectionId(value ?? NO_SECTION)}
                options={sectionOptions}
                placeholder="No section"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-12 shrink-0 px-3"
                onClick={() => setAddingSection(true)}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Your own heading. Attendees scroll through these.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
        <span className="flex-1">
          <span className="block text-sm font-semibold text-foreground">
            18+ only
          </span>
          <span className="block text-xs text-muted-foreground">
            For alcohol and anything else a minor may not buy. We check the
            buyer&apos;s age before the order is taken.
          </span>
        </span>
        <Switch
          checked={ageRestricted}
          onCheckedChange={setAgeRestricted}
          aria-label="18+ only"
        />
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending} className="min-w-36">
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
};

export default VendorItemForm;
