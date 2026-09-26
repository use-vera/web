"use client";

import AuthEventsCarousel from "@/components/auth/auth-events-carousel";
import SignInView from "@/components/auth/sign-in-view";
import SignUpView from "@/components/auth/sign-up-view";
import LogoMark from "@/components/logo-mark";
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
        className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <Store className="h-4 w-4" />
        {copy.crossLabel}
      </Link>
    </div>
  );

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1fr_minmax(30rem,38%)]">
      <aside className="relative hidden lg:block">
        {events.length > 0 ? (
          <AuthEventsCarousel
            events={events}
            className="absolute inset-0 h-full w-full sm:h-full sm:w-full"
          />
        ) : (
          /* No events to show yet, so the panel holds the brand rather than
             collapsing the layout to one lonely column. */
          <div className="dark absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background text-foreground">
            <LogoMark className="h-12 w-12" />
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              Tickets, events and the people selling at them, in one place.
            </p>
          </div>
        )}
      </aside>

      <main className="flex flex-col bg-background">
        <div className="flex items-center justify-between px-6 pt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vera
          </Link>

          <Link
            href={AUTH_ROUTES[role][view === "sign-in" ? "sign-up" : "sign-in"]}
            className="text-sm font-semibold text-foreground underline underline-offset-4"
          >
            {view === "sign-in" ? "Create an account" : "Sign in"}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
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
