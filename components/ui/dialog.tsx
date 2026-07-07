import { cn } from "@/lib/utils";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

const Dialog = BaseDialog.Root;
const DialogTrigger = BaseDialog.Trigger;
const DialogClose = BaseDialog.Close;

interface DialogContentProps extends BaseDialog.Popup.Props {
  showClose?: boolean;
}

const DialogContent = ({
  className,
  children,
  showClose = true,
  ...props
}: DialogContentProps) => {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-foreground/40" />
      <BaseDialog.Popup
        className={cn(
          "fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-card shadow-2xl outline-none",
          className,
        )}
        {...props}
      >
        {showClose ? (
          <BaseDialog.Close className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/90 text-foreground backdrop-blur-sm">
            <X className="h-4 w-4" />
          </BaseDialog.Close>
        ) : null}
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
};

export { Dialog, DialogClose, DialogContent, DialogTrigger };
