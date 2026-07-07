import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const OrganizerHero = () => {
  return (
    <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center sm:pt-28">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        For organizers
      </span>

      <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
        Hosting? Vera handles the rest.
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-base">
        Sell tickets, verify entry, control resale, and get discovered — all
        from one dashboard, with payouts that land in your account
        automatically.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link href="#pricing" className={buttonVariants({ size: "lg" })}>
          Start hosting free
        </Link>
        <Link
          href="#pricing"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "border-foreground/20 text-foreground hover:bg-foreground/5",
          )}
        >
          See how payouts work
        </Link>
      </div>
    </section>
  );
};

export default OrganizerHero;
