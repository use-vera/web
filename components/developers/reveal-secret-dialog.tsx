"use client";

import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, CircleAlert, Copy } from "lucide-react";
import { useState } from "react";

interface RevealSecretDialogProps {
  secretKey: string | null;
  onClose: () => void;
}

const RevealSecretDialog = ({
  secretKey,
  onClose,
}: RevealSecretDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!secretKey) return;
    await navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog
      open={Boolean(secretKey)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        className="max-w-lg"
        showClose={false}
      >
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <CircleAlert className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              Copy your secret key now
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            This is the only time your secret key will be shown. Store it
            somewhere safe. If you lose it, you&apos;ll need to create a new
            key.
          </p>

          <div className="flex items-center gap-2 rounded-sm border border-border bg-secondary px-4 py-3">
            <code className="flex-1 overflow-x-auto text-xs break-all text-foreground">
              {secretKey}
            </code>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
              aria-label="Copy secret key"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          <Button onClick={onClose} className="mt-2">
            {copied ? "Copied — done" : "I've saved it"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RevealSecretDialog;
