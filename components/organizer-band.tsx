import { buttonVariants } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const bullets = [
  "Sell tickets, no setup fee",
  "Verify entry in one tap",
  "Feature your event to more people",
  "Reach people through who they follow",
];

const OrganizerBand = () => {
  return (
    <section
      id="organizers"
      className="dark bg-background py-20 text-foreground"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-6">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            For organizers
          </span>
          <h2 className="max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
            Hosting? Vera handles the rest.
          </h2>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-3 w-3 text-primary" />
              </span>
              <span className="text-sm font-medium text-foreground/90">
                {bullet}
              </span>
            </li>
          ))}
        </ul>

        <Link href="/for-organizers" className={buttonVariants({ size: "lg" })}>
          Start hosting free
        </Link>
      </div>
    </section>
  );
};

export default OrganizerBand;
