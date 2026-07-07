import PhoneMockup from "@/components/phone-mockup";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import Image from "next/image";

type PhoneMockupVariant = React.ComponentProps<typeof PhoneMockup>["variant"];

interface FeatureRowProps {
  id?: string;
  eyebrow: string;
  eyebrowIcon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  variant?: PhoneMockupVariant;
  image?: string;
  reverse?: boolean;
  tinted?: boolean;
}

const FeatureRow = ({
  id,
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  bullets,
  variant,
  image,
  reverse = false,
  tinted = false,
}: FeatureRowProps) => {
  return (
    <section id={id} className={cn(tinted && "bg-secondary/60")}>
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-10">
        <div
          className={cn(
            "flex justify-center",
            reverse ? "md:order-2 md:justify-end" : "md:justify-start",
          )}
        >
          {image ? (
            <Image
              src={image}
              alt=""
              unoptimized
              width={480}
              height={480}
              className="w-full max-w-sm"
            />
          ) : variant ? (
            <PhoneMockup variant={variant} />
          ) : null}
        </div>

        <div
          className={cn(
            "flex flex-col gap-4",
            reverse ? "md:order-1" : undefined,
          )}
        >
          <div className="flex items-center gap-2 text-primary">
            <EyebrowIcon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">
              {eyebrow}
            </span>
          </div>

          <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {title}
          </h2>

          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <ul className="mt-2 flex flex-col gap-2.5">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2.5 text-sm font-medium text-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FeatureRow;
