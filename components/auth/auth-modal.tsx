"use client";

import AuthEventsCarousel from "@/components/auth/auth-events-carousel";
import SignInView from "@/components/auth/sign-in-view";
import SignUpView from "@/components/auth/sign-up-view";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEvents } from "@/lib/hooks/use-events";
import { cn } from "@/lib/utils";

export type AuthModalView = "sign-in" | "sign-up";

interface AuthModalProps {
  open: boolean;
  view: AuthModalView;
  onViewChange: (view: AuthModalView) => void;
  onOpenChange: (open: boolean) => void;
  onAuthenticated: () => void;
}

const AuthModal = ({
  open,
  view,
  onViewChange,
  onOpenChange,
  onAuthenticated,
}: AuthModalProps) => {
  const eventsQuery = useEvents({ filter: "upcoming", sort: "dateAsc", limit: 6 });
  const events = eventsQuery.data?.items ?? [];
  const showCarousel = events.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className={cn("p-0", showCarousel ? "sm:max-w-2xl" : "max-w-md")}
      >
        <div
          className={cn(
            "flex flex-col",
            showCarousel && "sm:grid sm:grid-cols-[minmax(0,1fr)_auto_14rem]",
          )}
        >
          <div className="min-w-0">
            {view === "sign-in" ? (
              <SignInView
                onSuccess={onAuthenticated}
                onSwitchToSignUp={() => onViewChange("sign-up")}
              />
            ) : (
              <SignUpView
                onSuccess={onAuthenticated}
                onSwitchToSignIn={() => onViewChange("sign-in")}
              />
            )}
          </div>

          {showCarousel ? (
            <>
              <div className="ticket-perforation-vertical hidden sm:block" />
              <AuthEventsCarousel events={events} className="hidden sm:flex sm:flex-col" />
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
