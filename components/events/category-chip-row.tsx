"use client";

import { getCategoryIcon } from "@/lib/category-icons";
import { type CategoryApi } from "@/lib/types/event";
import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";

interface CategoryChipRowProps {
  categories: CategoryApi[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
  className?: string;
}

const chipClasses = (active: boolean) =>
  cn(
    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors",
    active
      ? "border-primary bg-accent text-accent-foreground"
      : "border-border bg-transparent text-foreground hover:bg-secondary",
  );

const CategoryChipRow = ({
  categories,
  selectedCategoryId,
  onSelect,
  className,
}: CategoryChipRowProps) => {
  if (!categories.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={chipClasses(!selectedCategoryId)}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        All
      </button>
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.iconKey);
        const active = category._id === selectedCategoryId;

        return (
          <button
            key={category._id}
            type="button"
            onClick={() => onSelect(category._id)}
            className={chipClasses(active)}
          >
            <Icon className="h-3.5 w-3.5" />
            {category.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChipRow;
