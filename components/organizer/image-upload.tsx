"use client";

import { ImageCropper } from "@/components/organizer/image-cropper";
import Button from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useUploadImage } from "@/lib/hooks/use-organizer";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * The backend takes a base64 data URI and stores it on Cloudinary, so the file
 * is read in the browser and posted as text. There is no multipart endpoint.
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
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);

  /* The object URL is created here, in an event handler, and revoked when the
     cropper closes. The cropper itself only reads it. */
  const closeCropper = () => {
    setPendingSrc((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });
  };

  const pick = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image");
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("Images need to be under 10MB");
      return;
    }

    setPendingSrc(URL.createObjectURL(file));
  };

  /* The cropper hands back a 16:9 JPEG data URI, already sized for upload.
     The original never leaves the browser. */
  const uploadCrop = async (dataUri: string) => {
    try {
      const asset = await upload.mutateAsync(dataUri);
      onChange(asset.url);
      closeCropper();
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
        onChange={(event) => {
          pick(event.target.files?.[0]);
          /* Allow re-picking the same file after a cancel. */
          event.target.value = "";
        }}
      />

      <ImageCropper
        src={pendingSrc}
        isUploading={upload.isPending}
        onCancel={closeCropper}
        onCropped={(dataUri) => void uploadCrop(dataUri)}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-md border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Event cover"
            className="aspect-[16/9] w-full object-cover"
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
          className="flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background transition-colors hover:border-primary hover:bg-muted/40 disabled:cursor-wait"
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
            JPG or PNG, up to 10MB. Cropped to 16:9 so it fits everywhere.
          </span>
        </button>
      )}
    </div>
  );
};
