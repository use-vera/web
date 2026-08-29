"use client";

import { OrganizerField } from "@/components/organizer/organizer-field";
import { cn } from "@/lib/utils";
import * as React from "react";

const groupDigits = (digits: string) =>
  digits ? Number(digits).toLocaleString("en-NG") : "";

/**
 * A numeric field that shows thousands separators while holding a plain
 * numeric string in state. Money and counts are easier to read grouped.
 * "5,000" vs "5000", and easier to mistype without.
 *
 * `value` and `onValueChange` speak in bare digits; the commas exist only in
 * the rendered input.
 */
export const AmountField = ({
  value,
  onValueChange,
  prefix,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value: string | number;
  onValueChange: (digits: string) => void;
  /** e.g. "₦". Rendered inside the field, not part of the value. */
  prefix?: string;
}) => {
  const digits = String(value ?? "").replace(/[^0-9]/g, "");

  const field = (
    <OrganizerField
      {...props}
      inputMode="numeric"
      value={groupDigits(digits)}
      onChange={(event) =>
        onValueChange(event.target.value.replace(/[^0-9]/g, ""))
      }
      className={cn("tabular-nums", prefix && "pl-8", className)}
    />
  );

  if (!prefix) {
    return field;
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted-foreground">
        {prefix}
      </span>
      {field}
    </div>
  );
};
