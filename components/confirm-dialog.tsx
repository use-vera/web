"use client";

import Button from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { TriangleAlert } from "lucide-react";
import { type ReactNode } from "react";

/**
 * Destructive confirmation. The consequence goes in the body, and the confirm
 * button names the action rather than saying "OK". The same verb the user
 * clicked to get here.
 */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Keep editing",
  onConfirm,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showClose={false} className="max-w-md">
      <div className="p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/12 text-destructive">
          <TriangleAlert className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-lg font-bold tracking-[-0.01em]">{title}</h2>
        <div className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          {description}
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <DialogClose
            render={
              <Button size="sm" variant="outline" disabled={loading}>
                {cancelLabel}
              </Button>
            }
          />
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/60 text-destructive hover:bg-destructive/10"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
