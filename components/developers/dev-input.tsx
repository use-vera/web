import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * The Developer Portal's form field — rounded-md to match AuthField (the
 * app's real input convention for actual form fields), not the shared
 * Input component's rounded-full, which is a deliberate one-off reserved
 * for the events search bar.
 */
const DevInput = ({ className, type, ...props }: React.ComponentProps<"input">) => (
  <input
    type={type}
    className={cn(
      "h-11 w-full rounded-md border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
);

export default DevInput;
