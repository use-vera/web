"use client";

import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyFieldProps {
  value: string;
  /** Names the thing being copied, for the button's accessible label. */
  label: string;
  className?: string;
}

/** A read-only credential with a copy button. */
const CopyField = ({ value, label, className }: CopyFieldProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard access can be refused outright on an insecure origin. The
         value is on screen and selectable either way. */
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2",
        className,
      )}
    >
      <code className="flex-1 overflow-x-auto text-sm break-all text-foreground font-sans font-medium">
        {value}
      </code>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        aria-label={copied ? `${label} copied` : `Copy ${label}`}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
};

export default CopyField;
