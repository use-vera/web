"use client";

import { cn } from "@/lib/utils";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

const triggerClass =
  "flex h-12 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-4 text-left text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[popup-open]:border-primary";

const popupClass =
  "max-h-100 min-w-[var(--anchor-width)] overflow-y-auto rounded-md border border-border bg-popover p-1.5 shadow-xl outline-none transition-[transform,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0";

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2.5 text-sm font-medium text-foreground outline-none data-[highlighted]:bg-secondary data-[selected]:font-semibold";

const Options = ({ options }: { options: SelectOption[] }) => (
  <BaseSelect.List>
    {options.map((option) => (
      <BaseSelect.Item
        key={option.value}
        value={option.value}
        className={itemClass}
      >
        <BaseSelect.ItemIndicator className="flex h-4 w-4 items-center justify-center text-primary">
          <Check className="h-4 w-4" />
        </BaseSelect.ItemIndicator>
        <BaseSelect.ItemText className="flex-1">
          {option.label}
        </BaseSelect.ItemText>
      </BaseSelect.Item>
    ))}
  </BaseSelect.List>
);

const Popup = ({ options }: { options: SelectOption[] }) => (
  <BaseSelect.Portal>
    <BaseSelect.Positioner sideOffset={6} className="z-50 outline-none">
      <BaseSelect.Popup
        // Opening a select engages base-ui's scroll lock, which stops Lenis
        // (see SmoothScrollProvider), and a stopped Lenis still cancels every
        // wheel event, so long lists like banks can't scroll. Same opt-out as
        // the dialog popup.
        data-lenis-prevent
        className={popupClass}
      >
        <Options options={options} />
      </BaseSelect.Popup>
    </BaseSelect.Positioner>
  </BaseSelect.Portal>
);

interface SelectProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

/** Pick one. */
export const Select = ({
  value,
  onValueChange,
  options,
  placeholder = "Choose one",
  id,
  className,
  disabled,
}: SelectProps) => (
  <BaseSelect.Root
    value={value}
    onValueChange={(next) => onValueChange((next as string | null) ?? null)}
    items={options}
    disabled={disabled}
  >
    <BaseSelect.Trigger id={id} className={cn(triggerClass, className)}>
      <BaseSelect.Value placeholder={placeholder}>
        {(selected: string | null) =>
          selected ? (
            options.find((option) => option.value === selected)?.label
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )
        }
      </BaseSelect.Value>
      <BaseSelect.Icon>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
    <Popup options={options} />
  </BaseSelect.Root>
);

interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Pick several. The trigger names the first two and counts the rest, so a
 * vendor selling eight things does not get a trigger the width of the page.
 */
export const MultiSelect = ({
  value,
  onValueChange,
  options,
  placeholder = "Choose",
  id,
  className,
  disabled,
}: MultiSelectProps) => (
  <BaseSelect.Root
    multiple
    value={value}
    onValueChange={(next) => onValueChange((next as string[]) ?? [])}
    items={options}
    disabled={disabled}
  >
    <BaseSelect.Trigger id={id} className={cn(triggerClass, className)}>
      <BaseSelect.Value placeholder={placeholder}>
        {(selected: string[] | null) => {
          const picked = selected ?? [];

          if (picked.length === 0) {
            return <span className="text-muted-foreground">{placeholder}</span>;
          }

          const labels = picked.map(
            (item) =>
              options.find((option) => option.value === item)?.label ?? item,
          );

          return labels.length <= 2
            ? labels.join(", ")
            : `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
        }}
      </BaseSelect.Value>
      <BaseSelect.Icon>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
    <Popup options={options} />
  </BaseSelect.Root>
);
