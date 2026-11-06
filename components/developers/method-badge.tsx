import { POSTER_TONES, type PosterTone } from "@/components/vera/event-poster";
import { type HttpMethod } from "@/lib/developer-docs/endpoints";
import { cn } from "@/lib/utils";

/* Each verb on its own poster colour, so a list of endpoints scans by what it does. */
const METHOD_TONES: Record<HttpMethod, PosterTone> = {
  GET: "blue",
  POST: "green",
  PATCH: "yellow",
  DELETE: "pink",
};

const MethodBadge = ({ method, size = "md" }: { method: HttpMethod; size?: "sm" | "md" }) => {
  const colours = POSTER_TONES[METHOD_TONES[method]];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-sans font-extrabold",
        size === "sm" ? "h-5 min-w-11 px-1.5 text-[10px]" : "h-7 min-w-14 px-2.5 text-xs",
      )}
      style={{ backgroundColor: colours.bg, color: colours.fg }}
    >
      {method}
    </span>
  );
};

export default MethodBadge;
