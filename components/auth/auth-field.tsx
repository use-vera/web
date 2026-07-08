import { cn } from "@/lib/utils";
import * as React from "react";

interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
}

const AuthField = ({ label, className, id, ...props }: AuthFieldProps) => {
  const inputId =
    id ?? `auth-field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "h-12 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
};

export default AuthField;
