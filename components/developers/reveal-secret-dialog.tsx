"use client";

import CopyField from "@/components/developers/copy-field";
import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { type CreateApiKeyResponse } from "@/lib/types/workspace";
import { CircleAlert } from "lucide-react";

interface RevealSecretDialogProps {
  /** The freshly created key, or null when the dialog is closed. */
  createdKey: CreateApiKeyResponse | null;
  onClose: () => void;
}

/**
 * Shows both halves of a new key.
 *
 * Creating a key mints a pair: a publishable `pk_` and a secret `sk_`. Only
 * the secret used to appear here, which left people believing Vera issues
 * one key — and with no way to find the publishable one, which is the half
 * that is safe to ship to a browser.
 */
const RevealSecretDialog = ({ createdKey, onClose }: RevealSecretDialogProps) => (
  <Dialog
    open={Boolean(createdKey)}
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
  >
    <DialogContent
      aria-describedby={undefined}
      className="max-w-lg"
      showClose={false}
    >
      {createdKey ? (
        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-center gap-2">
            <CircleAlert className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              Copy your secret key now
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">
                Secret key
              </p>
              <p className="text-xs font-semibold text-primary">
                Shown once
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Server-side only. Vera stores just a hash, so this is the only
              time you will see it — if you lose it, create a replacement.
            </p>
            <CopyField value={createdKey.secretKey} label="secret key" />
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">
                Publishable key
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                Always available
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Safe in a browser or mobile app. It can only read events, so
              nothing it reaches can move money or admit anyone. You can come
              back for this one any time.
            </p>
            <CopyField
              value={createdKey.publishableKey}
              label="publishable key"
            />
          </div>

          <Button onClick={onClose}>I&apos;ve saved the secret key</Button>
        </div>
      ) : null}
    </DialogContent>
  </Dialog>
);

export default RevealSecretDialog;
