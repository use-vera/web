"use client";

import { cn } from "@/lib/utils";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

interface SwitchProps extends Omit<BaseSwitch.Root.Props, "className"> {
  className?: string;
}

/**
 * An on/off control. Base UI handles the semantics (role, keyboard, focus);
 * this only dresses it in Vera's colours.
 */
const Switch = ({ className, ...props }: SwitchProps) => (
  <BaseSwitch.Root
    className={cn(
      "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-none p-0.5 transition-colors",
      "bg-border data-[checked]:bg-primary",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <BaseSwitch.Thumb className="h-6 w-6 rounded-full bg-white shadow-sm transition-transform data-[checked]:translate-x-5" />
  </BaseSwitch.Root>
);

export default Switch;
