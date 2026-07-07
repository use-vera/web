import LogoMark from "@/components/logo-mark";
import Separator from "@/components/ui/separator";
import Link from "next/link";

const socialLinks = [
  { href: "#", label: "Instagram" },
  { href: "#", label: "X" },
  { href: "#", label: "TikTok" },
];

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "/events", label: "Events & Tickets" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/for-organizers", label: "For Organizers" },
      { href: "/download", label: "Download" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "#", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Terms" },
      { href: "#", label: "Privacy" },
    ],
  },
];

const SiteFooter = () => {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <LogoMark />
              <span className="text-lg font-bold text-foreground">Vera</span>
            </div>
            <p className="max-w-55 text-sm text-muted-foreground font-medium">
              Real events, real moments.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {column.title}
              </span>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Vera. All rights reserved.
          </span>
          <div className="flex items-center gap-4 text-muted-foreground">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                aria-label={`Vera on ${social.label}`}
                className="text-xs font-semibold transition-colors hover:text-foreground"
              >
                {social.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
