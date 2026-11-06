import { cn } from "@/lib/utils";

/** The app's mark on its tile plus the lowercase name. The tile takes the text colour, so it flips on dark pages. */
const Wordmark = ({ className }: { className?: string }) => (
  <span className={cn("flex items-center gap-2.5", className)}>
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
      <svg viewBox="0 0 120 120" aria-hidden="true" className="h-6 w-6">
        <path d="M28 100 L28 58 A32 32 0 0 1 92 58 L92 100" fill="none" stroke="#15C67C" strokeWidth={15} strokeLinecap="round" />
        <path d="M44 76 L60 56 L76 76" fill="none" stroke="#15C67C" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <span className="text-[26px] font-extrabold tracking-[-0.04em] text-foreground">vera</span>
  </span>
);

export default Wordmark;
