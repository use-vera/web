"use client";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
import Button from "@/components/ui/button";
import { useLogout, useSession } from "@/lib/hooks/use-auth";
import { navLinks } from "@/lib/nav-links";
import { useActiveNavHref } from "@/lib/use-active-nav-href";
import { cn, ROUTES } from "@/lib/utils";
import { LogOut, Menu, Ticket, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";

interface MobileNavProps {
  inverted?: boolean;
}

const MobileNav = ({ inverted = false }: MobileNavProps) => {
  const [open, setOpen] = useState(false);
  const isActive = useActiveNavHref();
  const router = useRouter();
  const sessionQuery = useSession();
  const logout = useLogout();
  const { openAuthModal } = useAuthModal();

  const user = sessionQuery.data?.user;

  const close = () => setOpen(false);

  const handleDownloadClick = () => {
    close();
    router.push(ROUTES.DOWNLOAD);
  };

  const handleSignIn = () => {
    close();
    openAuthModal({ view: "sign-in" });
  };

  const handleLogout = () => {
    close();
    logout.mutate(undefined, {
      onSuccess: () => router.push("/"),
    });
  };

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
                onClick={close}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    close();
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
                        onClick={close}
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

                  {user ? (
                    <Link
                      href={ROUTES.TICKETS}
                      onClick={close}
                      className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
                    >
                      <Ticket className="h-4 w-4" />
                      My tickets
                    </Link>
                  ) : null}
                </nav>

                <div className="mt-3 flex flex-col gap-2">
                  {user ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-destructive hover:bg-secondary"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={handleSignIn}>
                      Sign in
                    </Button>
                  )}
                  <Button className="w-full" onClick={handleDownloadClick}>
                    Download the app
                  </Button>
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
};

export default MobileNav;
