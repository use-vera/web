"use client";

import Button from "@/components/ui/button";
import { navLinks } from "@/lib/nav-links";
import { useActiveNavHref } from "@/lib/use-active-nav-href";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";

interface MobileNavProps {
  inverted?: boolean;
}

const MobileNav = ({ inverted = false }: MobileNavProps) => {
  const [open, setOpen] = useState(false);
  const isActive = useActiveNavHref();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open
        ? createPortal(
            <>
              <div
                role="button"
                tabIndex={0}
                aria-label="Dismiss menu"
                onClick={() => setOpen(false)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setOpen(false);
                  }
                }}
                className="fixed top-20 right-0 bottom-0 left-0 z-40 bg-black/40"
              />
              <div
                className={cn(
                  "fixed inset-x-0 top-20 z-50 rounded-b-2xl border-b border-x border-border bg-background px-6 pb-6 pt-2 shadow-xl",
                  inverted && "dark",
                )}
              >
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const active = isActive(link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "rounded-lg px-3 py-3 text-sm font-semibold transition-colors",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-secondary",
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
                <Button className="mt-3 w-full">Download the app</Button>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
};

export default MobileNav;
