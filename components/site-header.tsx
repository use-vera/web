"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import Wordmark from "@/components/vera/wordmark";
import MobileNav from "@/components/mobile-nav";
import Button from "@/components/ui/button";
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
  Megaphone,
  Store,
  Terminal,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { HEADER_MENU_ITEM, HEADER_MENU_PANEL, MenuLabel, MenuTile } from "@/components/header-menu";

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
      {/* No bar, no border: the mark, the links and one button sit on the page, the way the app's headers hang. */}
      <header className="sticky top-0 z-50 bg-background">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between gap-4 px-[clamp(16px,4vw,40px)]">
          <Link href="/" aria-label="Vera home">
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[15px] font-semibold whitespace-nowrap transition-colors",
                    active ? "text-primary" : "text-foreground hover:text-primary",
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
                      "group flex cursor-pointer items-center gap-1 rounded-full px-3.5 py-2 text-[15px] font-semibold whitespace-nowrap transition-colors data-[popup-open]:text-primary",
                      active ? "text-primary" : "text-foreground hover:text-primary",
                    )}
                  >
                    {menu.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[popup-open]:rotate-180" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" sideOffset={10} className={cn(HEADER_MENU_PANEL, "w-[340px]")}>
                    <span className="block px-2.5 pt-1.5 pb-2 text-[13px] font-semibold text-muted-foreground">
                      {menu.label}
                    </span>
                    {menu.items.map((item) => (
                      <DropdownMenuItem
                        key={item.href}
                        render={<Link href={item.href} />}
                        className={HEADER_MENU_ITEM}
                      >
                        <MenuTile icon={item.icon} tone={item.tone} />
                        <MenuLabel title={item.label} description={item.description} />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Your account menu"
                  className="group flex h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-border bg-transparent pr-3 pl-1 text-sm font-semibold text-foreground transition-colors hover:border-foreground data-[popup-open]:border-foreground"
                >
                  <Avatar>
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>
                      {user.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180" />
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={10} className={cn(HEADER_MENU_PANEL, "w-[320px]")}>
                  <div className="flex items-center gap-3 px-2.5 pt-2 pb-3">
                    <Avatar size="lg">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[15px] font-bold">{user.fullName}</span>
                      <span className="truncate text-[13px] text-muted-foreground">{user.email}</span>
                    </span>
                  </div>
                  <DropdownMenuItem render={<Link href={ROUTES.ACCOUNT} />} className={HEADER_MENU_ITEM}>
                    <MenuTile icon={Ticket} tone="green" />
                    <MenuLabel title="Your account" description="Tickets, payments and premium." />
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={ROUTES.ORGANIZER} />} className={HEADER_MENU_ITEM}>
                    <MenuTile icon={Megaphone} tone="yellow" />
                    <MenuLabel title="Organizer dashboard" description="Your events, sales and payouts." />
                  </DropdownMenuItem>
                  {/* Offered only to people who actually sell: for everyone
                      else it would be a link to a sign-up they did not ask
                      for. */}
                  {vendor ? (
                    <DropdownMenuItem render={<Link href={ROUTES.VENDOR_MENU} />} className={HEADER_MENU_ITEM}>
                      <MenuTile icon={Store} tone="pink" />
                      <MenuLabel title="Vendor dashboard" description="Your menu, orders and money." />
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem render={<Link href={ROUTES.DEVELOPERS} />} className={HEADER_MENU_ITEM}>
                    <MenuTile icon={Terminal} tone="blue" />
                    <MenuLabel title="Developer portal" description="Keys, docs and the sandbox." />
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadClick} className={HEADER_MENU_ITEM}>
                    <MenuTile icon={Download} tone="ink" />
                    <MenuLabel title="Get the app" description="Your tickets, offline at the door." />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-2.5 my-2" />
                  <DropdownMenuItem
                    onClick={() => setConfirmLogout(true)}
                    className="gap-2 rounded-[18px] px-3 py-3 text-[15px] font-bold text-destructive data-[highlighted]:bg-secondary"
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
                  className="px-3 py-2 text-[15px] font-semibold whitespace-nowrap text-foreground transition-colors hover:text-primary"
                >
                  Sign in
                </Link>
                <Button variant="ink" size="sm" className="h-11 px-5 text-[15px]" onClick={handleDownloadClick}>
                  Get the app
                </Button>
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
