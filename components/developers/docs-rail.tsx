"use client";

import { cn, ROUTES } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SECTIONS = [
  { href: ROUTES.DEVELOPERS_DOCS, label: "Docs" },
  { href: ROUTES.DEVELOPERS_API, label: "API" },
];

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
      const scroller = document.getElementById(ids[0])?.closest<HTMLElement>(
        "[data-docs-scroll]",
      );

      if (scroller) {
        const atBottom =
          scroller.scrollTop + scroller.clientHeight >=
          scroller.scrollHeight - 24;

        if (atBottom) {
          current = ids[ids.length - 1];
        }
      }

      setActiveId(current);
    };

    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    measure();

    /* Capture phase: the portal scrolls an inner element, not the window,
       and scroll events do not bubble. Capturing catches it wherever it
       happens, so this keeps working if the layout ever changes. */
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
 * The right-hand rail: which half of the portal you are in, then where you
 * are inside the page.
 *
 * The section switch used to sit in the left sidebar above its nav, where it
 * read as a third level of navigation stacked on two others. Here it pairs
 * with the contents list, and the left sidebar is left to do one job.
 */
const DocsRail = ({ headings = [] }: DocsRailProps) => {
  const pathname = usePathname();
  const activeId = useActiveHeading(headings.map((heading) => heading.id));

  return (
    <aside className="hidden w-52 shrink-0 xl:block">
      <div className="sticky top-14 flex flex-col gap-6">
        <div
          role="tablist"
          aria-label="Documentation section"
          className="flex rounded-full bg-muted p-1"
        >
          {SECTIONS.map((section) => {
            const active = pathname.startsWith(section.href);

            return (
              <Link
                key={section.href}
                href={section.href}
                role="tab"
                aria-selected={active}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 text-center text-sm font-semibold transition-colors",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {section.label}
              </Link>
            );
          })}
        </div>

        {headings.length > 1 ? (
          <nav aria-label="On this page" className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              On this page
            </p>
            <ul className="flex flex-col border-l border-border">
              {headings.map((heading) => {
                const active = heading.id === activeId;

                return (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      aria-current={active ? "location" : undefined}
                      className={cn(
                        "-ml-px block border-l py-1 pl-3 text-sm transition-colors",
                        active
                          ? "border-foreground font-semibold text-foreground"
                          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      {heading.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </div>
    </aside>
  );
};

export default DocsRail;
