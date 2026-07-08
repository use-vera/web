"use client";

import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

interface TicketQrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

const TicketQrCode = ({ value, size = 176, className }: TicketQrCodeProps) => {
  const safeValue = value.trim() || "VRA-CODE";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl bg-white p-3 shadow-sm",
        className,
      )}
    >
      <QRCodeSVG
        value={safeValue}
        size={size}
        level="H"
        marginSize={0}
        fgColor="#101012"
        bgColor="#FFFFFF"
      />
    </div>
  );
};

export default TicketQrCode;
