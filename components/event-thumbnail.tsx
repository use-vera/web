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

const EventThumbnail = ({
  imageUrl,
  alt = "",
  className,
  iconClassName,
}: EventThumbnailProps) => {
  const [failed, setFailed] = useState(false);

  if (imageUrl && !failed) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={cn("object-cover", iconClassName)}
          onError={() => setFailed(true)}
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
      <Ticket className={cn("h-10 w-10 text-primary/70", iconClassName)} strokeWidth={1.5} />
    </div>
  );
};

export default EventThumbnail;
