import { cn } from "@/lib/utils";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";

const Accordion = BaseAccordion.Root;

const AccordionItem = ({
  className,
  ...props
}: BaseAccordion.Item.Props) => (
  <BaseAccordion.Item
    className={cn("border-b border-border", className)}
    {...props}
  />
);

const AccordionTrigger = ({
  className,
  children,
  ...props
}: BaseAccordion.Trigger.Props) => (
  <BaseAccordion.Header>
    <BaseAccordion.Trigger
      className={cn(
        "group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-bold text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
    </BaseAccordion.Trigger>
  </BaseAccordion.Header>
);

const AccordionPanel = ({
  className,
  children,
  ...props
}: BaseAccordion.Panel.Props) => (
  <BaseAccordion.Panel
    className={cn(
      "overflow-hidden text-sm leading-relaxed text-muted-foreground transition-[height] data-[ending-style]:h-0 data-[starting-style]:h-0",
      className,
    )}
    {...props}
  >
    <div className="pb-5">{children}</div>
  </BaseAccordion.Panel>
);

export { Accordion, AccordionItem, AccordionPanel, AccordionTrigger };
