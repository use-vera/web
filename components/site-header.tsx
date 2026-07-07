"use client";

import LogoMark from "@/components/logo-mark";
import MobileNav from "@/components/mobile-nav";
import Button from "@/components/ui/button";
import { navLinks } from "@/lib/nav-links";
import { useActiveNavHref } from "@/lib/use-active-nav-href";
import { cn, ROUTES } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SiteHeaderProps {
  inverted?: boolean;
}

const SiteHeader = ({ inverted = false }: SiteHeaderProps) => {
  const isActive = useActiveNavHref();

  // Hooks
  const router = useRouter();

  // Helpers
  const handleDownloadClick = () => {
    router.push(ROUTES.DOWNLOAD);
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

        <div className="hidden md:block">
          <Button onClick={handleDownloadClick}>Download the app</Button>
        </div>

        <MobileNav inverted={inverted} />
      </div>
    </header>
  );
};

export default SiteHeader;
