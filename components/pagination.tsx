"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** What is being counted, e.g. "attendee". Pluralised with a trailing s. */
  noun?: string;
  className?: string;
}

/**
 * Numbered pages with an ellipsis, rather than infinite scroll. An organizer
 * looking for one attendee among a thousand needs to be able to go back to
 * where they were.
 */
const pagesToShow = (page: number, totalPages: number): (number | "gap")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page]);

  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < totalPages) pages.add(page + 1);
  if (page <= 3) [2, 3, 4].forEach((value) => pages.add(value));
  if (page >= totalPages - 2)
    [totalPages - 3, totalPages - 2, totalPages - 1].forEach((value) =>
      pages.add(value),
    );

  const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  const output: (number | "gap")[] = [];

  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) {
      output.push("gap");
    }

    output.push(value);
  });

  return output;
};

export const Pagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  noun = "row",
  className,
}: PaginationProps) => {
  if (totalItems === 0) {
    return null;
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-5 py-3.5",
        className,
      )}
    >
      <span className="text-xs text-muted-foreground tabular-nums">
        {first.toLocaleString("en-NG")}–{last.toLocaleString("en-NG")} of{" "}
        {totalItems.toLocaleString("en-NG")} {noun}
        {totalItems === 1 ? "" : "s"}
      </span>

      {totalPages > 1 ? (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pagesToShow(page, totalPages).map((entry, index) =>
            entry === "gap" ? (
              <span
                key={`gap-${index}`}
                aria-hidden
                className="px-1 text-xs text-muted-foreground"
              >
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                onClick={() => onPageChange(entry)}
                className={cn(
                  "h-8 min-w-8 cursor-pointer rounded-md px-2 text-[13px] font-semibold tabular-nums transition-colors",
                  entry === page
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {entry}
              </button>
            ),
          )}

          <button
            type="button"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      ) : null}
    </div>
  );
};
