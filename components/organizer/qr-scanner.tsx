"use client";

import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/**
 * The browser's built-in barcode reader. It ships in Chromium (Chrome, Edge,
 * Android Chrome) and is absent in Safari and Firefox, so support is probed
 * rather than assumed — where it is missing the door falls back to the
 * hardware scanner and manual entry, which work everywhere.
 */
interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
}

const getDetectorConstructor = (): BarcodeDetectorConstructor | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor })
      .BarcodeDetector ?? null
  );
};

type ScannerState =
  | "idle"
  | "starting"
  | "scanning"
  | "denied"
  | "unsupported"
  | "error";

export const QrScanner = ({
  onDetect,
  disabled = false,
}: {
  onDetect: (code: string) => void;
  disabled?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastCodeRef = useRef<{ value: string; at: number } | null>(null);
  const onDetectRef = useRef(onDetect);
  const disabledRef = useRef(disabled);

  const [state, setState] = useState<ScannerState>("idle");

  /* Read support from the browser rather than copying it into state in an
     effect. The server snapshot assumes support so the fallback copy does not
     flash before hydration decides. */
  const supported = useSyncExternalStore(
    () => () => {},
    () => getDetectorConstructor() !== null,
    () => true,
  );

  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    const Detector = getDetectorConstructor();

    if (!Detector) {
      setState("unsupported");
      return;
    }

    setState("starting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new Detector({ formats: ["qr_code"] });
      setState("scanning");

      const tick = async () => {
        const video = videoRef.current;

        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
          rafRef.current = requestAnimationFrame(() => void tick());
          return;
        }

        try {
          const results = await detector.detect(video);
          const value = results[0]?.rawValue?.trim();

          /* One ticket held up to the lens fires many frames; ignore repeats
             of the same code inside three seconds so the door does not submit
             it over and over. */
          const now = Date.now();
          const last = lastCodeRef.current;
          const isRepeat =
            last && last.value === value && now - last.at < 3000;

          if (value && !isRepeat && !disabledRef.current) {
            lastCodeRef.current = { value, at: now };
            onDetectRef.current(value);
          }
        } catch {
          /* A dropped frame is not worth surfacing; keep scanning. */
        }

        rafRef.current = requestAnimationFrame(() => void tick());
      };

      rafRef.current = requestAnimationFrame(() => void tick());
    } catch (error) {
      stop();
      setState(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "denied"
          : "error",
      );
    }
  }, [stop]);

  useEffect(() => stop, [stop]);

  const effectiveState: ScannerState = supported ? state : "unsupported";
  const isLive = effectiveState === "scanning";

  return (
    <div className="relative h-[300px] overflow-hidden rounded-md border border-border bg-[#16150f]">
      <video
        ref={videoRef}
        muted
        playsInline
        className={cn(
          "h-full w-full object-cover transition-opacity",
          isLive ? "opacity-100" : "opacity-0",
        )}
      />

      {isLive ? (
        <div className="pointer-events-none absolute inset-8">
          <span className="absolute top-0 left-0 h-9 w-9 rounded-tl-lg border-t-2 border-l-2 border-primary" />
          <span className="absolute top-0 right-0 h-9 w-9 rounded-tr-lg border-t-2 border-r-2 border-primary" />
          <span className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-lg border-b-2 border-l-2 border-primary" />
          <span className="absolute right-0 bottom-0 h-9 w-9 rounded-br-lg border-r-2 border-b-2 border-primary" />
        </div>
      ) : null}

      {isLive ? (
        <div className="absolute right-0 bottom-4 left-0 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground/80 px-3 py-1.5 text-xs font-semibold text-background backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Scanning
          </span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-10 text-center">
          {effectiveState === "starting" ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : effectiveState === "unsupported" ||
            effectiveState === "denied" ||
            effectiveState === "error" ? (
            <CameraOff className="h-6 w-6 text-[#93917f]" />
          ) : (
            <Camera className="h-6 w-6 text-primary" />
          )}

          <p className="text-sm font-semibold text-[#f5f3ef]">
            {effectiveState === "starting"
              ? "Starting the camera…"
              : effectiveState === "denied"
                ? "Camera permission was declined"
                : effectiveState === "unsupported"
                  ? "This browser can't scan with the camera"
                  : effectiveState === "error"
                    ? "Couldn't start the camera"
                    : "Scan tickets with the camera"}
          </p>

          <p className="max-w-xs text-xs leading-relaxed text-[#93917f]">
            {effectiveState === "unsupported"
              ? "Chrome or Edge can read QR codes from the camera. A handheld scanner and the reference field below work in every browser."
              : effectiveState === "denied"
                ? "Allow camera access in your browser settings, or keep using a handheld scanner and the field below."
                : "Point the camera at the QR on their phone. A handheld scanner types into the field below instead."}
          </p>

          {effectiveState === "idle" || effectiveState === "error" ? (
            <Button
              type="button"
              size="sm"
              className="mt-1 h-9"
              onClick={() => void start()}
            >
              <Camera className="h-4 w-4" />
              {effectiveState === "error" ? "Try again" : "Turn on the camera"}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
};
