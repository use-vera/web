"use client";

import AuthEventsCarousel from "@/components/auth/auth-events-carousel";
import SignInView from "@/components/auth/sign-in-view";
import SignUpView from "@/components/auth/sign-up-view";
import Wordmark from "@/components/vera/wordmark";
import {
  AUTH_COPY,
  AUTH_ROUTES,
  POST_AUTH_ROUTE,
  type AuthRole,
  type AuthView,
} from "@/lib/auth-roles";
import { isEventStrictlyUpcoming } from "@/lib/event-status";
import { useEvents } from "@/lib/hooks/use-events";
import { ArrowLeft, Store } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface AuthPageProps {
  role: AuthRole;
  view: AuthView;
}

/**
 * The full-page counterpart to the auth modal: the same forms, with the events
 * carousel given room to be the reason you are signing up rather than a
 * decorative rail. Attendees and merchants get the identical layout.
 */
const AuthPage = ({ role, view }: AuthPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // "upcoming" still includes events in progress, so filter those out: this
  // panel previews what is coming up, not what is happening now.
  const eventsQuery = useEvents({
    filter: "upcoming",
    sort: "dateAsc",
    limit: 10,
  });
  const events = (eventsQuery.data?.items ?? [])
    .filter(isEventStrictlyUpcoming)
    .slice(0, 6);

  const copy = AUTH_COPY[role][view];
  const redirectTo = searchParams.get("redirectTo");

  const handleSuccess = () => {
    router.push(redirectTo || POST_AUTH_ROUTE[role]);
  };

  /* The other role's door, kept out of the primary flow so it never competes
     with the form itself. */
  const footer = (
    <div className="mt-2 border-t border-border pt-5">
      <Link
        href={copy.crossHref}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <Store className="h-4 w-4" />
        {copy.crossLabel}
      </Link>
    </div>
  );

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-background lg:grid-cols-[1fr_minmax(30rem,40%)]">
      <aside className="relative hidden p-4 lg:block">
        {events.length > 0 ? (
          <AuthEventsCarousel
            events={events}
            className="absolute inset-4 h-auto w-auto rounded-[36px] sm:h-auto sm:w-auto"
          />
        ) : (
          /* No events to show yet, so the panel holds the brand rather than
             collapsing the layout to one lonely column. */
          <div className="dark absolute inset-4 flex flex-col justify-end gap-4 rounded-[36px] bg-background p-10 text-foreground">
            <span style={{ lineHeight: 0.85 }} className="text-[clamp(96px,12vw,180px)] font-extrabold tracking-[-0.06em]">
              vera<span className="text-primary">.</span>
            </span>
            <p className="max-w-xs text-base text-muted-foreground">
              Tickets, events and the people selling at them, in one place.
            </p>
          </div>
        )}
      </aside>

      <main className="flex flex-col">
        <div className="flex items-center justify-between px-[clamp(16px,4vw,40px)] pt-6">
          <Link href="/" aria-label="Back to Vera" className="flex items-center gap-3">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <Wordmark />
          </Link>

          <Link
            href={AUTH_ROUTES[role][view === "sign-in" ? "sign-up" : "sign-in"]}
            className="rounded-full border-[1.5px] border-foreground px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5"
          >
            {view === "sign-in" ? "Create an account" : "Sign in"}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-[clamp(16px,4vw,40px)] py-10">
          <div className="w-full max-w-sm">
            {view === "sign-in" ? (
              <SignInView
                role={role}
                onSuccess={handleSuccess}
                switchToSignUpHref={AUTH_ROUTES[role]["sign-up"]}
                footer={footer}
                className="p-0 pt-0"
              />
            ) : (
              <SignUpView
                role={role}
                onSuccess={handleSuccess}
                switchToSignInHref={AUTH_ROUTES[role]["sign-in"]}
                footer={footer}
                className="p-0 pt-0"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
