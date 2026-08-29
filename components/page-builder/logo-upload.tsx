"use client";

import { getApiErrorMessage } from "@/lib/api/error-message";
import { useUploadImage } from "@/lib/hooks/use-organizer";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

const MAX_BYTES = 4 * 1024 * 1024;

const readAsDataUri = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.readAsDataURL(file);
  });

/**
 * Sponsor logos and line-up portraits. Shares the cover's upload path but skips
 * the cropper: a logo has its own ratio and a fixed frame would cut it.
 */
export const LogoUpload = ({
  value,
  label,
  shape = "wide",
  onChange,
}: {
  value?: string;
  label: string;
  /** `wide` suits a wordmark, `square` a portrait. Preview framing only. */
  shape?: "wide" | "square";
  onChange: (url: string | undefined) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();

  const pick = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image");
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("Logos need to be under 4MB");
      return;
    }

    try {
      const asset = await upload.mutateAsync(await readAsDataUri(file));
      onChange(asset.url);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't upload that image"));
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(event) => {
          void pick(event.target.files?.[0]);
          /* Allow re-picking the same file after a cancel. */
          event.target.value = "";
        }}
      />

      {value ? (
        <div className="flex items-center gap-2">
          <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted ring-1 ring-border ring-inset ${
              shape === "square" ? "h-11 w-11" : "h-11 w-20"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className={
                shape === "square"
                  ? "h-full w-full object-cover"
                  : "max-h-9 max-w-[68px] object-contain"
              }
            />
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={upload.isPending}
            className="h-8 cursor-pointer rounded-full border border-border px-3 text-[12px] font-semibold transition-colors hover:bg-secondary disabled:cursor-wait"
          >
            {upload.isPending ? "Uploading…" : "Replace"}
          </button>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/60 hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-border text-[12.5px] font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:cursor-wait"
        >
          {upload.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" />
          )}
          {upload.isPending ? "Uploading…" : label}
        </button>
      )}
    </div>
  );
};
