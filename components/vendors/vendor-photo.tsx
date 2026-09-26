import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";
import Image from "next/image";

interface VendorPhotoProps {
  /**
   * A file under /public (e.g. "/images/vendors/stall.jpg"). While it is
   * undefined the slot renders as a composed panel rather than a broken box,
   * so the page is presentable before the photography arrives.
   */
  src?: string;
  alt: string;
  /** What this photo should show. Shown in place of the image until there is one. */
  hint: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

const VendorPhoto = ({
  src,
  alt,
  hint,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
}: VendorPhotoProps) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_60%)] p-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/70">
            <Camera className="h-5 w-5 text-muted-foreground" />
          </span>
          <span className="max-w-xs text-sm font-medium text-muted-foreground">
            {hint}
          </span>
        </div>
      )}
    </div>
  );
};

export default VendorPhoto;
