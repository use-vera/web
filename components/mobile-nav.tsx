"use client";

import Button from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useLogout, useSession } from "@/lib/hooks/use-auth";
import { navLinks, navMenus } from "@/lib/nav-links";
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

  const user = sessionQuery.data?.user;

  const close = () => setOpen(false);

  const handleDownloadClick = () => {
    close();
    router.push(ROUTES.DOWNLOAD);
  };

  const handleSignIn = () => {
    close();
    router.push(ROUTES.SIGN_IN);
  };

  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setConfirmLogout(false);
        close();
        router.push("/");
      },
    });
  };

  return (
    <div className="md:hidden">
      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Sign out of Vera?"
        description="Your tickets stay on your account. You will just need to sign back in to see them."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        loading={logout.isPending}
        onConfirm={handleLogout}
      />
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

                  {/* No room for a dropdown on a phone, so the group opens
                      flat under its own label. */}
                  {navMenus.map((menu) => (
                    <div key={menu.label} className="mt-2 flex flex-col gap-1">
                      <span className="px-3 pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {menu.label}
                      </span>
                      {menu.items.map((item) => {
                        const active = isActive(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={close}
                            className={cn(
                              "rounded-lg px-3 py-3 text-sm font-semibold transition-colors",
                              active
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground hover:bg-secondary",
                            )}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  ))}

                  {user ? (
                    <Link
                      href={ROUTES.TICKETS}
                      onClick={close}
                      className="mt-2 flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
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
                      onClick={() => setConfirmLogout(true)}
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
