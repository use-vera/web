import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface QrCodePlaceholderProps {
  className?: string;
}

const QrCodePlaceholder = ({ className }: QrCodePlaceholderProps) => (
  <div className={cn("rounded-lg bg-foreground p-1", className)}>
    <Image
      src={IMAGES.barcode}
      alt="Scan to download"
      height={112}
      width={112}
      className="h-full w-full rounded-lg border object-contain"
    />
  </div>
);

export default QrCodePlaceholder;
