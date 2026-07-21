"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

interface TocLink {
  id: string;
  label: string;
}

interface TocGroup {
  label: string;
  links: TocLink[];
}

interface DocsTocProps {
  topLinks: TocLink[];
  groups: TocGroup[];
}

const DocsToc = ({ topLinks, groups }: DocsTocProps) => {
  const allIds = useMemo(
    () => [...topLinks, ...groups.flatMap((group) => group.links)].map((link) => link.id),
    [topLinks, groups],
  );
  const [activeId, setActiveId] = useState<string | null>(allIds[0] ?? null);

  useEffect(() => {
    const elements = allIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) {
      return;
    }

    // The docs page scrolls its own region (app/developers/layout.tsx opts
    // this <main> out of the app-wide Lenis smooth-scroll and uses native
    // overflow-y-auto instead) — the observer's root has to be that
    // element, not the default viewport, or it never fires.
    const root = document.querySelector<HTMLElement>("[data-lenis-prevent]");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);

        if (!visible.length) {
          return;
        }

        const topMost = visible.reduce((closest, entry) =>
          entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest,
        );

        setActiveId(topMost.target.id);
      },
      {
        root,
        // Treat a section as "active" once it's crossed just below the
        // scroll-mt-24 offset used for anchor landing, rather than only
        // once it's fully in view — biases the window toward the top of
        // the scroll region.
        rootMargin: "-96px 0px -70% 0px",
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [allIds]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    // scrollIntoView respects scroll-margin-top (scroll-mt-24 on every
    // section) and correctly targets the nearest scrollable ancestor on
    // its own — exactly "land on the section, with padding at the top".
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  const linkClassName = (id: string) =>
    cn(
      "block truncate rounded-sm px-2 py-1.5 font-medium transition-colors",
      activeId === id
        ? "bg-secondary text-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
    );

  return (
    <nav className="sticky top-8 flex flex-col gap-1 text-sm">
      {topLinks.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          onClick={(event) => handleClick(event, link.id)}
          className={linkClassName(link.id)}
        >
          {link.label}
        </a>
      ))}

      {groups.map((group) => (
        <div key={group.label} className="mt-6">
          <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          {group.links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(event) => handleClick(event, link.id)}
              className={linkClassName(link.id)}
            >
              {link.label}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
};

export default DocsToc;
