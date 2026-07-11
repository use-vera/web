"use client";

import { cn } from "@/lib/utils";
import { Ticket } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface EventThumbnailProps {
  imageUrl?: string;
  alt?: string;
  className?: string;
  iconClassName?: string;
}

/**
 * next/image throws (rather than firing onError) for hosts outside
 * next.config.ts's remotePatterns, so unrecognized hosts — e.g. stray local
 * upload URLs in seed data — must be filtered out before render, not caught.
 */
const isOptimizableImageUrl = (url: string) => {
  try {
    return new URL(url).hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
};

const EventThumbnail = ({
  imageUrl,
  alt = "",
  className,
  iconClassName,
}: EventThumbnailProps) => {
  // Keyed to the url itself (not a plain boolean) so a component reused
  // across changing imageUrls — e.g. a rotating carousel — doesn't keep
  // showing the fallback for every image after just one of them fails.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasFailed = failedUrl === imageUrl;

  if (imageUrl && isOptimizableImageUrl(imageUrl) && !hasFailed) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={cn("object-cover", iconClassName)}
          onError={() => setFailedUrl(imageUrl)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-linear-to-br from-accent to-secondary",
        className,
      )}
    >
      <Ticket
        className={cn("h-10 w-10 text-primary/70", iconClassName)}
        strokeWidth={1.5}
      />
    </div>
  );
};

export default EventThumbnail;
