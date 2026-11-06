"use client";

import CopyField from "@/components/developers/copy-field";
import Button from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { POSTER_TONES } from "@/components/vera/event-poster";
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
    <DialogContent aria-describedby={undefined} className="max-w-lg rounded-[28px] border-[1.5px] border-border bg-background" showClose={false}>
      {createdKey ? (
        <div className="flex flex-col gap-5 p-6 sm:p-7">
          <DialogTitle style={{ lineHeight: 0.95 }} className="text-[32px] font-extrabold tracking-[-0.045em]">
            copy it <span className="text-primary">now.</span>
          </DialogTitle>

          <section
            className="flex flex-col gap-2.5 rounded-[22px] p-4 sm:p-5"
            style={{ backgroundColor: POSTER_TONES.yellow.bg, color: POSTER_TONES.yellow.fg }}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-[15px] font-bold">
                <CircleAlert className="h-4 w-4" />
                Secret key
              </h3>
              <span className="rounded-full bg-[#2A220C] px-2.5 py-0.5 text-xs font-bold text-[#E6C56B]">Shown once</span>
            </div>
            <p className="text-[13px] leading-relaxed font-medium opacity-85">
              Server-side only. Vera stores just a hash, so this is the only time you will see it. If you lose it, create a replacement.
            </p>
            <CopyField value={createdKey.secretKey} label="secret key" className="bg-[#F5F3EF]" />
          </section>

          <section className="flex flex-col gap-2.5 rounded-[22px] border-[1.5px] border-border p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[15px] font-bold">Publishable key</h3>
              <span className="text-xs font-semibold text-muted-foreground">Always available</span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Safe in a browser or mobile app. It can only read events, so nothing it reaches can move money or admit anyone.
            </p>
            <CopyField value={createdKey.publishableKey} label="publishable key" />
          </section>

          <Button variant="ink" onClick={onClose}>
            I&apos;ve saved the secret key
          </Button>
        </div>
      ) : null}
    </DialogContent>
  </Dialog>
);

export default RevealSecretDialog;
