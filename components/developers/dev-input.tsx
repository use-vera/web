import { cn } from "@/lib/utils";
import * as React from "react";

/** The portal's form field, drawn like the dashboards' fields: an outline on the page colour that turns ink on focus. */
const DevInput = ({ className, type, ...props }: React.ComponentProps<"input">) => (
  <input
    type={type}
    className={cn(
      "h-12 w-full rounded-2xl border-[1.5px] border-border bg-transparent px-4 text-[15px] text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
);

export default DevInput;
