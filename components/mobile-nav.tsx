"use client";

import Button from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MenuTile } from "@/components/header-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { POSTER_TONES } from "@/components/vera/event-poster";
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
    <div className="lg:hidden">
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
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-foreground text-background"
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
                className="fixed top-20 right-0 bottom-0 left-0 z-40 bg-black/30"
              />
              <div
                className={cn(
                  "fixed inset-x-0 top-20 z-50 rounded-b-[28px] bg-background px-[clamp(16px,4vw,40px)] pt-2 pb-6",
                  inverted && "dark",
                )}
              >
                <nav aria-label="Main" className="flex flex-col">
                  {navLinks.map((link) => {
                    const active = isActive(link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={close}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "border-b border-border py-3.5 text-xl font-bold tracking-[-0.02em] transition-colors",
                          active ? "text-primary" : "text-foreground",
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}

                  {/* No room for a dropdown on a phone, so the group opens
                      flat under its own label. */}
                  {navMenus.map((menu) => (
                    <div key={menu.label} className="mt-4 flex flex-col">
                      <span className="pb-1 text-sm font-semibold text-muted-foreground">
                        {menu.label}
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {menu.items.map((item) => {
                          const active = isActive(item.href);

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={close}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "flex items-center gap-2.5 rounded-[18px] py-2 pr-2 text-[15px] font-bold transition-colors",
                                active ? "text-primary" : "text-foreground",
                              )}
                            >
                              <MenuTile icon={item.icon} tone={item.tone} className="h-9 w-9 rounded-[12px]" />
                              <span className="min-w-0">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {user ? (
                    <Link
                      href={ROUTES.ACCOUNT}
                      onClick={close}
                      className="mt-4 flex items-center gap-3 rounded-[22px] p-2 pr-4 text-foreground"
                      style={{ backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg }}
                    >
                      <Avatar size="lg">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[15px] font-bold">{user.fullName}</span>
                        <span className="text-[13px] font-semibold opacity-75">Tickets, payments and premium</span>
                      </span>
                      <Ticket className="h-5 w-5 shrink-0" />
                    </Link>
                  ) : null}
                </nav>

                <div className="mt-5 flex flex-col gap-2">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => setConfirmLogout(true)}
                      className="flex cursor-pointer items-center justify-center gap-2 py-3 text-base font-semibold text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  ) : (
                    <Button variant="line" size="lg" className="w-full" onClick={handleSignIn}>
                      Sign in
                    </Button>
                  )}
                  <Button variant="ink" size="lg" className="w-full" onClick={handleDownloadClick}>
                    Get the app
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
