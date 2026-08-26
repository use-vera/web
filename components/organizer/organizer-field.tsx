import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * The organizer dashboard's form field. rounded-md, matching AuthField and
 * DevInput — the app's real convention for form fields. The shared Input
 * component's rounded-full is a deliberate one-off for the events search bar
 * and does not belong on dashboard surfaces.
 */
export const OrganizerField = ({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) => (
  <input
    type={type}
    className={cn(
      "h-12 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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
      "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none",
      className,
    )}
    {...props}
  />
);
