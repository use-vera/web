import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * The organizer dashboard's form field, drawn like AuthField: an outline on
 * the page colour that turns ink when focused, no fill.
 */
export const OrganizerField = ({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) => (
  <input
    type={type}
    className={cn(
      "h-12 w-full rounded-2xl border-[1.5px] border-border bg-transparent px-4 text-[15px] text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      "aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive",
      className,
    )}
    {...props}
  />
);

export const OrganizerTextarea = ({
  className,
  ...props
}: React.ComponentProps<"textarea">) => (
  <textarea
    className={cn(
      "w-full rounded-2xl border-[1.5px] border-border bg-transparent px-4 py-3 text-[15px] text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:outline-none",
      className,
    )}
    {...props}
  />
);
