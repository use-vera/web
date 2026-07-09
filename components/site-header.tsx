"use client";

import { useAuthModal } from "@/components/auth/auth-modal-provider";
import LogoMark from "@/components/logo-mark";
import MobileNav from "@/components/mobile-nav";
import Button from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, useLogout } from "@/lib/hooks/use-auth";
import { navLinks } from "@/lib/nav-links";
import { useActiveNavHref } from "@/lib/use-active-nav-href";
import { cn, ROUTES } from "@/lib/utils";
import { ChevronDown, Download, LogOut, Terminal, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SiteHeaderProps {
  inverted?: boolean;
}

const SiteHeader = ({ inverted = false }: SiteHeaderProps) => {
  const isActive = useActiveNavHref();

  const router = useRouter();
  const sessionQuery = useSession();
  const logout = useLogout();
  const { openAuthModal } = useAuthModal();

  const user = sessionQuery.data?.user;

  const handleDownloadClick = () => {
    router.push(ROUTES.DOWNLOAD);
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/"),
    });
  };

  return (
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
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-12.5 items-center gap-2 rounded-full border border-border bg-secondary px-4 text-sm font-semibold text-foreground">

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
                {user.fullName.split(" ")[0]}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  render={<Link href={ROUTES.TICKETS} />}
                >
                  <Ticket className="h-4 w-4" />
                  My tickets
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href={ROUTES.DEVELOPERS} />}
                >
                  <Terminal className="h-4 w-4" />
                  Developer Portal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadClick}>
                  <Download className="h-4 w-4" />
                  Download the app
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => openAuthModal({ view: "sign-in" })}
              >
                Sign in
              </Button>
              <Button onClick={handleDownloadClick}>Download the app</Button>
            </>
          )}
        </div>

        <MobileNav inverted={inverted} />
      </div>
    </header>
  );
};

export default SiteHeader;
