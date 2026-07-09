import { type HttpMethod } from "@/lib/developer-docs/endpoints";
import { cn } from "@/lib/utils";

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: "bg-blue-500/10 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
  POST: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  PATCH:
    "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  DELETE: "bg-red-500/10 text-red-700 dark:bg-red-400/10 dark:text-red-300",
};

const MethodBadge = ({ method }: { method: HttpMethod }) => (
  <span
    className={cn(
      "inline-flex h-6 min-w-10 items-center justify-center rounded-md px-2 font-sans text-[11px] font-bold",
      METHOD_STYLES[method],
    )}
  >
    {method}
  </span>
);

export default MethodBadge;
