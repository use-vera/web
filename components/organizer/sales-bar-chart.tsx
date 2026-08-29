"use client";

import { type SeriesPoint } from "@/lib/organizer-series";
import { cn } from "@/lib/utils";
import { useState } from "react";

/**
 * One series, one hue. Bars are never recoloured by rank, so the tallest bar
 * looks like every other bar and the peak is called out with a direct label
 * instead. Values sit in text tokens, not the series colour.
 */
export const SalesBarChart = ({
  points,
  height = 170,
  labelEvery = 1,
}: {
  points: SeriesPoint[];
  height?: number;
  labelEvery?: number;
}) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const max = Math.max(1, ...points.map((point) => point.value));
  const peakKey = points.reduce(
    (best, point) => (point.value > (best?.value ?? -1) ? point : best),
    null as SeriesPoint | null,
  )?.key;
  const total = points.reduce((sum, point) => sum + point.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No sales in this window yet.
      </div>
    );
  }

  return (
    <div>
      <div className="relative flex items-end gap-0.5" style={{ height }}>
        {points.map((point) => {
          const isActive = activeKey === point.key;
          const isPeak = point.key === peakKey && point.value > 0;

          return (
            <div
              key={point.key}
              className="group relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setActiveKey(point.key)}
              onMouseLeave={() => setActiveKey(null)}
            >
              {isActive ? (
                <div
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-foreground px-2.5 py-1.5 text-background shadow-lg"
                >
                  <div className="text-xs font-semibold tabular-nums">
                    {point.value} {point.value === 1 ? "ticket" : "tickets"}
                  </div>
                  <div className="text-[11px] opacity-70">{point.fullLabel}</div>
                </div>
              ) : null}

              {isPeak && !isActive ? (
                <span className="mb-1 text-center text-[11px] font-semibold text-muted-foreground tabular-nums">
                  {point.value}
                </span>
              ) : null}

              <button
                type="button"
                aria-label={`${point.fullLabel}: ${point.value} tickets`}
                onFocus={() => setActiveKey(point.key)}
                onBlur={() => setActiveKey(null)}
                className={cn(
                  "w-full cursor-default rounded-t-[4px] bg-primary transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isActive ? "opacity-100" : "opacity-85",
                )}
                style={{
                  height: `${Math.max(2, (point.value / max) * 100)}%`,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex gap-0.5 border-t border-border pt-2">
        {points.map((point, index) => (
          <span
            key={point.key}
            className="flex-1 text-center text-[11px] font-medium text-muted-foreground"
          >
            {index % labelEvery === 0 ? point.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
};
