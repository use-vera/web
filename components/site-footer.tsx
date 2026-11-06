import Wordmark from "@/components/vera/wordmark";
import Link from "next/link";

const socialLinks = [
  { href: "#", label: "Instagram" },
  { href: "#", label: "X" },
  { href: "#", label: "TikTok" },
];

const footerColumns = [
  {
    title: "Going out",
    links: [
      { href: "/events", label: "Events & Tickets" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/download", label: "Download" },
    ],
  },
  {
    title: "Sell on Vera",
    links: [
      { href: "/for-organizers", label: "For Organizers" },
      { href: "/for-vendors", label: "For Vendors" },
      { href: "/developers/docs", label: "Developers" },
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

/** Links on a hairline, then the name set huge, the way the app signs off. */
const SiteFooter = () => {
  return (
    <footer className="bg-background text-foreground">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-10 px-[clamp(16px,4vw,40px)] pt-16 pb-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-border pt-8 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <Wordmark />
            <p className="max-w-60 text-[15px] text-muted-foreground">Real events, real moments.</p>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-muted-foreground">{column.title}</span>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[15px] font-medium transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <span aria-hidden="true" className="text-[clamp(96px,20vw,280px)] leading-[0.8] font-extrabold tracking-[-0.06em]">
            vera<span className="text-primary">.</span>
          </span>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={`Vera on ${social.label}`}
                  className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  {social.label}
                </Link>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Vera · Lagos</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
