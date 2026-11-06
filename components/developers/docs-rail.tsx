"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/** How far down the viewport a heading counts as "the one being read". */
const ACTIVE_LINE_PX = 140;

/**
 * Tracks which heading the reader is currently under.
 *
 * Measured from each heading's position rather than with an
 * IntersectionObserver: a section taller than the viewport has no heading
 * intersecting at all for most of its length, and an observer then has
 * nothing to report, so the highlight falls off mid-section. Asking "which
 * heading did we last scroll past" has an answer at every scroll position.
 */
const useActiveHeading = (headingIds: string[]) => {
  const [activeId, setActiveId] = useState<string | null>(
    headingIds[0] ?? null,
  );

  /* A fresh array every render would restart the effect every render, so the
     list travels as one string and is unpacked inside. */
  const idKey = headingIds.join("|");

  useEffect(() => {
    const ids = idKey ? idKey.split("|") : [];

    if (!ids.length) {
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;

      let current = ids[0];

      for (const id of ids) {
        const element = document.getElementById(id);

        if (element && element.getBoundingClientRect().top <= ACTIVE_LINE_PX) {
          current = id;
        }
      }

      /* The last heading wins once the page is scrolled to the bottom, which
         it otherwise never would when the final section is short. */
      const scroller = document.documentElement;
      const atBottom = window.scrollY + window.innerHeight >= scroller.scrollHeight - 24;

      if (atBottom) {
        current = ids[ids.length - 1];
      }

      setActiveId(current);
    };

    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    measure();

    /* Capture phase, so this still hears the scroll if a page ever moves it
       into an inner element (scroll events do not bubble). */
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [idKey]);

  return activeId;
};

interface DocsRailProps {
  headings?: { id: string; label: string }[];
}

/**
 * The right-hand rail: where you are on this page. Which part of the portal
 * you are in lives in the left rail.
 */
const DocsRail = ({ headings = [] }: DocsRailProps) => {
  const activeId = useActiveHeading(headings.map((heading) => heading.id));

  if (headings.length < 2) {
    return null;
  }

  return (
    <aside className="hidden w-56 shrink-0 xl:block">
      <nav aria-label="On this page" className="sticky top-10 flex flex-col gap-3 pt-[clamp(20px,3vw,40px)]">
        <p className="px-3 text-[13px] font-bold">On this page</p>
        <ul className="flex flex-col gap-0.5">
          {headings.map((heading) => {
            const active = heading.id === activeId;

            return (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", active ? "bg-primary" : "bg-border")} />
                  {heading.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default DocsRail;
