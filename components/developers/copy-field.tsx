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
        "flex items-center gap-2 rounded-2xl bg-secondary py-2 pr-2 pl-4",
        className,
      )}
    >
      <code className="min-w-0 flex-1 font-mono text-[13px] font-medium break-all text-foreground">
        {value}
      </code>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-background text-muted-foreground transition-colors hover:text-foreground"
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
