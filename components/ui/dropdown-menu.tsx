import { cn } from "@/lib/utils";
import { Menu as BaseMenu } from "@base-ui/react/menu";

const DropdownMenu = BaseMenu.Root;
const DropdownMenuTrigger = BaseMenu.Trigger;

interface DropdownMenuContentProps extends BaseMenu.Popup.Props {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const DropdownMenuContent = ({
  className,
  align = "end",
  sideOffset = 8,
  children,
  ...props
}: DropdownMenuContentProps) => {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        side="bottom"
        align={align}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <BaseMenu.Popup
          className={cn(
            "min-w-48 origin-[var(--transform-origin)] rounded-xl border border-border bg-card p-1.5 shadow-xl outline-none transition-[transform,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
};

const DropdownMenuItem = ({
  className,
  ...props
}: BaseMenu.Item.Props) => (
  <BaseMenu.Item
    className={cn(
      "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground outline-none data-[highlighted]:bg-secondary",
      className,
    )}
    {...props}
  />
);

const DropdownMenuSeparator = ({
  className,
  ...props
}: BaseMenu.Separator.Props) => (
  <BaseMenu.Separator
    className={cn("my-1.5 h-px bg-border", className)}
    {...props}
  />
);

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
