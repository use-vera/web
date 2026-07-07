import { cn } from "@/lib/utils";

interface PerforatedDividerProps {
  className?: string;
}

const PerforatedDivider = ({ className }: PerforatedDividerProps) => {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={cn("ticket-perforation w-full", className)}
    />
  );
};

export default PerforatedDivider;
