"use client";

import { useUploadVendorImage } from "@/lib/hooks/use-vendor";
import { cn } from "@/lib/utils";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

/* The upload endpoint takes a base64 data URI, so the file is read in the
   browser first. Anything much larger than this is a phone photo nobody
   needs at full size for a menu thumbnail. */
const MAX_BYTES = 5 * 1024 * 1024;

const readAsDataUri = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

interface VendorImageInputProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  /** Round for a logo, tall for an item photo. */
  shape?: "circle" | "tile";
  className?: string;
}

const VendorImageInput = ({
  value,
  onChange,
  label,
  shape = "tile",
  className,
}: VendorImageInputProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const upload = useUploadVendorImage();

  const shown = preview || value;

  const handleFile = async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("That image is over 5MB. Try a smaller one.");
      return;
    }

    try {
      const dataUri = await readAsDataUri(file);
      /* Shown straight away, so the form does not sit blank while the upload
         is in flight. Replaced by the stored URL once it lands. */
      setPreview(dataUri);

      const url = await upload.mutateAsync(dataUri);
      onChange(url);
    } catch {
      setPreview("");
      toast.error("Couldn't upload that image. Try again.");
    }
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <label
        htmlFor={inputId}
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden border border-dashed border-border bg-background transition-colors hover:border-primary",
          shape === "circle"
            ? "h-20 w-20 rounded-full"
            : "h-20 w-20 rounded-2xl",
        )}
      >
        {shown ? (
          <Image
            src={shown}
            alt=""
            fill
            sizes="112px"
            className="object-cover"
            /* A data: preview cannot go through the image optimizer. */
            unoptimized={shown.startsWith("data:")}
          />
        ) : (
          <Camera className="h-6 w-6 text-muted-foreground" />
        )}

        {upload.isPending ? (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
          </span>
        ) : null}

        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void handleFile(file);
            }
          }}
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {shown ? "Tap the image to replace it" : "JPG or PNG, up to 5MB"}
        </span>
        {shown ? (
          <button
            type="button"
            onClick={() => {
              setPreview("");
              onChange("");

              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
            className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" />
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default VendorImageInput;
