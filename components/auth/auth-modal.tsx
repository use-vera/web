"use client";

import AuthEventsCarousel from "@/components/auth/auth-events-carousel";
import SignInView from "@/components/auth/sign-in-view";
import SignUpView from "@/components/auth/sign-up-view";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { isEventStrictlyUpcoming } from "@/lib/event-status";
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
  // "upcoming" only excludes events that have already *ended*, so it still
  // includes ones currently in progress — filter those out here since this
  // panel is meant to preview what's coming up next, not what's live now.
  const eventsQuery = useEvents({ filter: "upcoming", sort: "dateAsc", limit: 10 });
  const events = (eventsQuery.data?.items ?? [])
    .filter(isEventStrictlyUpcoming)
    .slice(0, 6);
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
