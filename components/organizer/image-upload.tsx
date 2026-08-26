"use client";

import Button from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useUploadImage } from "@/lib/hooks/use-organizer";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

const MAX_BYTES = 5 * 1024 * 1024;

const readAsDataUri = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn't read that file"));
    reader.readAsDataURL(file);
  });

/**
 * The backend takes a base64 data URI and stores it on Cloudinary, so the file
 * is read in the browser and posted as text — there is no multipart endpoint.
 */
export const ImageUpload = ({
  value,
  onChange,
}: {
  value?: string;
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
      toast.error("Images need to be under 5MB");
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
        accept="image/*"
        className="sr-only"
        onChange={(event) => void pick(event.target.files?.[0])}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-md border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Event cover"
            className="h-[200px] w-full object-cover"
          />
          <div className="absolute right-3 bottom-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 bg-card/90 text-xs backdrop-blur-sm"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-label="Remove cover image"
              className="h-9 w-9 border-destructive/60 bg-card/90 p-0 text-destructive backdrop-blur-sm"
              onClick={() => onChange(undefined)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="flex h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background transition-colors hover:border-primary hover:bg-muted/40 disabled:cursor-wait"
        >
          {upload.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold">
            {upload.isPending ? "Uploading…" : "Add a cover image"}
          </span>
          <span className="text-xs text-muted-foreground">
            JPG or PNG, up to 5MB. This is the first thing people see.
          </span>
        </button>
      )}
    </div>
  );
};
