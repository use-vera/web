"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import LogoMark from "@/components/logo-mark";
import MobileNav from "@/components/mobile-nav";
import Button, { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout, useSession } from "@/lib/hooks/use-auth";
import { useMyVendor } from "@/lib/hooks/use-vendor";
import { navLinks, navMenus } from "@/lib/nav-links";
import { useActiveNavHref } from "@/lib/use-active-nav-href";
import { cn, ROUTES } from "@/lib/utils";
import {
  ChevronDown,
  Download,
  LogOut,
  ShieldCheck,
  Store,
  Terminal,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface SiteHeaderProps {
  inverted?: boolean;
}

const SiteHeader = ({ inverted = false }: SiteHeaderProps) => {
  const isActive = useActiveNavHref();

  const router = useRouter();
  const sessionQuery = useSession();
  const logout = useLogout();

  const user = sessionQuery.data?.user;
  /* Only asked once someone is signed in, and only to decide whether to offer
     them their vendor dashboard. */
  const vendorQuery = useMyVendor(Boolean(user));
  const vendor = vendorQuery.data ?? null;

  const handleDownloadClick = () => {
    router.push(ROUTES.DOWNLOAD);
  };

  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setConfirmLogout(false);
        router.push("/");
      },
    });
  };

  return (
    <>
      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Sign out of Vera?"
        description="Your tickets stay on your account, you will just need to sign back in to see them."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        loading={logout.isPending}
        onConfirm={handleLogout}
      />
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="text-xl font-bold text-foreground">Vera</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {navMenus.map((menu) => {
              const active = menu.items.some((item) => isActive(item.href));

              return (
                <DropdownMenu key={menu.label}>
                  <DropdownMenuTrigger
                    className={cn(
                      "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {menu.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-72">
                    {menu.items.map((item) => (
                      <DropdownMenuItem
                        key={item.href}
                        render={<Link href={item.href} />}
                        className="flex-col items-start gap-0.5"
                      >
                        <span>{item.label}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.description}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-12.5 items-center gap-2 rounded-full border border-border bg-secondary px-4 text-sm font-semibold text-foreground">
                  <Avatar>
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>
                      {user.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem render={<Link href={ROUTES.TICKETS} />}>
                    <Ticket className="h-4 w-4" />
                    My tickets
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={ROUTES.ORGANIZER} />}>
                    <ShieldCheck className="h-4 w-4" />
                    Organizer Dashboard
                  </DropdownMenuItem>
                  {/* Offered only to people who actually sell: for everyone
                      else it would be a link to a sign-up they did not ask
                      for. */}
                  {vendor ? (
                    <DropdownMenuItem render={<Link href={ROUTES.VENDOR_MENU} />}>
                      <Store className="h-4 w-4" />
                      Vendor Dashboard
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem render={<Link href={ROUTES.DEVELOPERS} />}>
                    <Terminal className="h-4 w-4" />
                    Developer Portal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadClick}>
                    <Download className="h-4 w-4" />
                    Download the app
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setConfirmLogout(true)}
                    className="text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* A deliberate page rather than the modal: arriving from the
                    header is a trip to sign in, not an interruption of
                    something else. The modal still covers in-flow prompts. */}
                <Link
                  href={ROUTES.SIGN_IN}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  Sign in
                </Link>
                <Button onClick={handleDownloadClick}>Download the app</Button>
              </>
            )}
          </div>

          <MobileNav inverted={inverted} />
        </div>
      </header>
    </>
  );
};

export default SiteHeader;
