import { POSTER_TONES, type PosterTone } from "@/components/vera/event-poster";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

/**
 * The header's popups: a paper panel with big rounded corners and an edge
 * instead of a heavy shadow, the way the app's sheets sit.
 */
export const HEADER_MENU_PANEL =
  "rounded-[26px] border-[1.5px] border-border bg-background p-2 shadow-[0_18px_40px_-18px_rgba(22,21,15,0.28)]";

/** One row in a header menu. Tile on the left in a poster tone, label and a line under it. */
export const HEADER_MENU_ITEM =
  "items-center gap-3.5 rounded-[18px] px-2.5 py-2.5 data-[highlighted]:bg-secondary";

interface MenuTileProps {
  icon: LucideIcon;
  tone: PosterTone;
  className?: string;
}

export const MenuTile = ({ icon: Icon, tone, className }: MenuTileProps) => {
  const colours = POSTER_TONES[tone];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]",
        /* Cream is the page colour, so it needs an edge to read as a tile. */
        tone === "cream" && "ring-1 ring-border ring-inset",
        className,
      )}
      style={{ backgroundColor: colours.bg, color: colours.fg }}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
    </span>
  );
};

interface MenuLabelProps {
  title: string;
  description?: string;
}

export const MenuLabel = ({ title, description }: MenuLabelProps) => (
  <span className="flex min-w-0 flex-col gap-0.5">
    <span className="text-[15px] font-bold text-foreground">{title}</span>
    {description ? <span className="text-[13px] font-medium text-muted-foreground">{description}</span> : null}
  </span>
);
