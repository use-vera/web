"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/lib/hooks/use-categories";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

/** Up to ten, matching the backend's cap on categoryIds. */
const MAX_CATEGORIES = 10;

export const CategoryPicker = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) => {
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data ?? [];

  if (categoriesQuery.isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No categories are available right now.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const selected = value.includes(category._id);
        const atLimit = !selected && value.length >= MAX_CATEGORIES;

        return (
          <button
            key={category._id}
            type="button"
            disabled={atLimit}
            aria-pressed={selected}
            onClick={() =>
              onChange(
                selected
                  ? value.filter((id) => id !== category._id)
                  : [...value, category._id],
              )
            }
            className={cn(
              "cursor-pointer rounded-full transition-opacity disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <span
              className={cn(
                "flex h-10 items-center gap-1.5 rounded-full border-[1.5px] px-4 text-sm font-semibold transition-colors",
                selected ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:border-foreground",
              )}
            >
              {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5" />}
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
