"use client";

import { BLOCK_CATALOG, blockDefinition } from "@/lib/page-blocks-catalog";
import {
  type BlockType,
  type PageBlock,
  isBoundBlock,
  isLockedBlock,
} from "@/lib/types/event-page";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Globe,
  GripVertical,
  Lock,
  Plus,
} from "lucide-react";
import { useState } from "react";

/** The page as a list. Reorder here, edit in the inspector. */
export const BlockOutline = ({
  blocks,
  selectedId,
  slug,
  published,
  onSelect,
  onMove,
  onAdd,
}: {
  blocks: PageBlock[];
  selectedId: string | null;
  slug: string;
  published: boolean;
  onSelect: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onAdd: (type: BlockType) => void;
}) => {
  const [adding, setAdding] = useState(false);

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card lg:w-[280px] lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between px-3.5 pt-4 pb-2.5">
        <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/70">
          Sections
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {blocks.length}
        </span>
      </div>

      <div className="flex max-h-[40vh] flex-col gap-px overflow-y-auto px-2 lg:max-h-none">
        {blocks.map((block, index) => {
          const definition = blockDefinition(block.type);
          const locked = isLockedBlock(block.type);
          const isSelected = selectedId === block.id;

          return (
            <div
              key={block.id}
              className={cn(
                "group flex items-center gap-1.5 rounded-sm px-2",
                isSelected && "bg-accent ring-1 ring-primary ring-inset",
              )}
            >
              <GripVertical
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  locked
                    ? "text-muted-foreground/30"
                    : "text-muted-foreground/60",
                )}
              />
              <button
                type="button"
                onClick={() => onSelect(block.id)}
                className={cn(
                  "flex h-9 min-w-0 flex-1 cursor-pointer items-center gap-2 text-left text-[13px]",
                  isSelected
                    ? "font-semibold text-accent-foreground"
                    : "font-medium",
                )}
              >
                <span className="truncate">
                  {definition?.label ?? block.type}
                </span>
                {isBoundBlock(block.type) ? (
                  <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.04em] text-accent-foreground uppercase">
                    Live
                  </span>
                ) : null}
              </button>

              {locked ? (
                <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
              ) : (
                <span className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => onMove(index, index - 1)}
                    className="flex h-6 w-5 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-25"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index >= blocks.length - 1}
                    onClick={() => onMove(index, index + 1)}
                    className="flex h-6 w-5 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-25"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3">
        {adding ? (
          <div className="rounded-sm ring-1 ring-border ring-inset">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/70">
                Add a section
              </span>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="cursor-pointer text-[11px] font-semibold text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="max-h-[240px] overflow-y-auto px-2 pb-2">
              {BLOCK_CATALOG.map((definition) => (
                <button
                  key={definition.type}
                  type="button"
                  onClick={() => {
                    onAdd(definition.type);
                    setAdding(false);
                  }}
                  className="flex w-full cursor-pointer flex-col gap-0.5 rounded-sm px-2 py-2 text-left transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-2 text-[13px] font-semibold">
                    {definition.label}
                    {definition.bound ? (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.04em] text-accent-foreground uppercase">
                        Live
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[11px] leading-relaxed text-muted-foreground">
                    {definition.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border text-[13px] font-semibold transition-colors hover:bg-secondary active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add section
          </button>
        )}
      </div>

      <div className="mt-auto hidden border-t border-border p-3.5 lg:block">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate font-sans text-[11px] font-semibold">
            vera.tickets/{slug}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {published ? "Live" : "Not published yet"}
        </div>
      </div>
    </aside>
  );
};
