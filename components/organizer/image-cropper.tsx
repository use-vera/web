"use client";

import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { COVER_ASPECT } from "@/lib/cloudinary";
import { Loader2, Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";

const OUTPUT_WIDTH = 1600;
const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / COVER_ASPECT);
const MAX_ZOOM = 4;

interface Loaded {
  element: HTMLImageElement;
  width: number;
  height: number;
}

/**
 * Crops to a fixed 16:9 before upload, so the organizer sees the framing
 * everyone else will get. Cropping only at render is why one cover looked
 * right on the web and wrong in the app, each surface guessed differently.
 *
 * The geometry is kept in SOURCE pixels (a crop rectangle over the original)
 * rather than screen pixels, so the preview can be any width and the exported
 * crop is identical either way.
 */
export const ImageCropper = ({
  src,
  onCancel,
  onCropped,
  isUploading,
}: {
  /** Object URL for the chosen file. The caller owns and revokes it. */
  src: string | null;
  onCancel: () => void;
  onCropped: (dataUri: string) => void;
  isUploading: boolean;
}) => {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerX: number; pointerY: number; perPixel: number } | null>(null);

  const reset = () => {
    setLoaded(null);
    setZoom(1);
    setOrigin({ x: 0, y: 0 });
  };

  /* The largest 16:9 rectangle the image can give, shrunk by the zoom. */
  const cropWidth = loaded
    ? Math.min(loaded.width, loaded.height * COVER_ASPECT) / zoom
    : 0;
  const cropHeight = cropWidth / COVER_ASPECT;
  const maxX = loaded ? Math.max(0, loaded.width - cropWidth) : 0;
  const maxY = loaded ? Math.max(0, loaded.height - cropHeight) : 0;

  const clamp = (next: { x: number; y: number }) => ({
    x: Math.min(maxX, Math.max(0, next.x)),
    y: Math.min(maxY, Math.max(0, next.y)),
  });

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const element = event.currentTarget;
    const width = element.naturalWidth;
    const height = element.naturalHeight;
    const initialCropWidth = Math.min(width, height * COVER_ASPECT);
    const initialCropHeight = initialCropWidth / COVER_ASPECT;

    setLoaded({ element, width, height });
    setZoom(1);
    /* Start centred. The subject is usually mid-frame. */
    setOrigin({
      x: (width - initialCropWidth) / 2,
      y: (height - initialCropHeight) / 2,
    });
  };

  const applyZoom = (nextZoom: number) => {
    const clampedZoom = Math.min(MAX_ZOOM, Math.max(1, nextZoom));

    if (!loaded) {
      setZoom(clampedZoom);
      return;
    }

    const nextCropWidth =
      Math.min(loaded.width, loaded.height * COVER_ASPECT) / clampedZoom;
    const nextCropHeight = nextCropWidth / COVER_ASPECT;

    /* Zoom about the centre of what is currently framed. */
    const centreX = origin.x + cropWidth / 2;
    const centreY = origin.y + cropHeight / 2;

    setOrigin({
      x: Math.min(
        Math.max(0, loaded.width - nextCropWidth),
        Math.max(0, centreX - nextCropWidth / 2),
      ),
      y: Math.min(
        Math.max(0, loaded.height - nextCropHeight),
        Math.max(0, centreY - nextCropHeight / 2),
      ),
    });
    setZoom(clampedZoom);
  };

  const exportCrop = () => {
    if (!loaded) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(
      loaded.element,
      origin.x,
      origin.y,
      cropWidth,
      cropHeight,
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT,
    );

    onCropped(canvas.toDataURL("image/jpeg", 0.85));
  };

  /* Percentages, so the preview works at any container width. */
  const displayWidth = loaded ? (loaded.width / cropWidth) * 100 : 100;
  const displayLeft = loaded ? -(origin.x / cropWidth) * 100 : 0;
  const displayTop = loaded ? -(origin.y / cropHeight) * 100 : 0;

  return (
    <Dialog
      open={Boolean(src)}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onCancel();
        }
      }}
    >
      <DialogContent showClose={false} className="max-w-[540px] p-0">
        <div className="p-5 sm:p-6">
          <h2 className="text-lg font-bold tracking-[-0.01em]">
            Position the cover
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Anything outside the frame is cropped. This is what people see on
            the web and in the app.
          </p>

          <div
            className="relative mt-5 w-full touch-none overflow-hidden rounded-md bg-muted select-none"
            style={{ aspectRatio: String(COVER_ASPECT) }}
            onPointerDown={(event) => {
              if (!loaded) {
                return;
              }

              const rect = event.currentTarget.getBoundingClientRect();
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = {
                pointerX: event.clientX,
                pointerY: event.clientY,
                /* Screen pixels to source pixels for this frame width. */
                perPixel: cropWidth / rect.width,
              };
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current;

              if (!drag) {
                return;
              }

              const deltaX = (event.clientX - drag.pointerX) * drag.perPixel;
              const deltaY = (event.clientY - drag.pointerY) * drag.perPixel;

              dragRef.current = {
                ...drag,
                pointerX: event.clientX,
                pointerY: event.clientY,
              };

              setOrigin((current) =>
                clamp({ x: current.x - deltaX, y: current.y - deltaY }),
              );
            }}
            onPointerUp={() => {
              dragRef.current = null;
            }}
            onPointerCancel={() => {
              dragRef.current = null;
            }}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                onLoad={handleLoad}
                draggable={false}
                className="absolute max-w-none cursor-grab active:cursor-grabbing"
                style={{
                  width: `${displayWidth}%`,
                  left: `${displayLeft}%`,
                  top: `${displayTop}%`,
                }}
              />
            ) : null}

            {!loaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => applyZoom(zoom - 0.25)}
              disabled={zoom <= 1}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              aria-label="Zoom"
              onChange={(event) => applyZoom(Number(event.target.value))}
              className="h-1 flex-1 cursor-pointer accent-primary"
            />
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => applyZoom(zoom + 0.25)}
              disabled={zoom >= MAX_ZOOM}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 text-xs text-muted-foreground tabular-nums">
            Drag to reposition &middot; saved at {OUTPUT_WIDTH}&times;{OUTPUT_HEIGHT}
          </p>

          <div className="mt-6 flex justify-end gap-2.5">
            <Button
              size="sm"
              variant="outline"
              disabled={isUploading}
              onClick={() => {
                reset();
                onCancel();
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!loaded || isUploading}
              loading={isUploading}
              onClick={exportCrop}
            >
              Use this crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
