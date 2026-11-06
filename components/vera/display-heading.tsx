import { cn } from "@/lib/utils";

interface DisplayHeadingProps {
  /** Lowercase, the house voice: "this week in". */
  lead: React.ReactNode;
  /** The last words, set in green and ending in a full stop: "lagos." */
  accent?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  /** Break before the accent instead of running on. */
  breakBeforeAccent?: boolean;
  className?: string;
  id?: string;
}

/**
 * The big heavy heading every page section opens with, the same voice as the
 * app: bold lowercase, a full stop, the last words in green.
 */
const DisplayHeading = ({ lead, accent, as: Tag = "h2", breakBeforeAccent = false, className, id }: DisplayHeadingProps) => (
  <Tag
    id={id}
    /* Line height inline: tailwind-merge drops a leading-* class whenever a
       text-size class (which carries its own line height) comes after it. */
    style={{ lineHeight: 0.92 }}
    className={cn(
      "font-extrabold tracking-[-0.05em] text-foreground",
      Tag === "h1" ? "text-[clamp(52px,9vw,128px)]" : "text-[clamp(40px,6vw,88px)]",
      className,
    )}
  >
    {lead}
    {/* A block, not a <br>: when the lead fills its line exactly, a <br> leaves an empty line behind it. */}
    {accent ? (
      breakBeforeAccent ? (
        <span className="block text-primary">{accent}</span>
      ) : (
        <>
          {" "}
          <span className="text-primary">{accent}</span>
        </>
      )
    ) : null}
  </Tag>
);

/** A small label above a heading: "Meet Vera". Sentence case, no tracking. */
export const Eyebrow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("text-sm font-semibold text-muted-foreground", className)}>{children}</span>
);

export default DisplayHeading;
