import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
}

const LogoMark = ({ className }: LogoMarkProps) => {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <path
        d="M28 100 L28 58 A32 32 0 0 1 92 58 L92 100"
        fill="none"
        stroke="#0FB26E"
        strokeWidth={15}
        strokeLinecap="round"
      />
      <path
        d="M44 76 L60 56 L76 76"
        fill="none"
        stroke="#0FB26E"
        strokeWidth={15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LogoMark;
