"use client";

import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/hooks/use-auth";
import { useCurrentWorkspace } from "@/lib/hooks/use-workspace";
import { ROUTES } from "@/lib/utils";
import { KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";

const Centered = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-[60vh] items-center justify-center px-6">
    {children}
  </div>
);

/**
 * Its own component so the workspace query mounts only once there is a
 * session to make it with. Calling the hook above the sign-in check would
 * fire a request that is certain to 401 for every signed-out reader.
 */
const WorkspaceGate = ({ children }: { children: React.ReactNode }) => {
  const { workspace, isLoading, isError } = useCurrentWorkspace();

  if (isLoading) {
    return (
      <Centered>
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </Centered>
    );
  }

  if (isError || !workspace) {
    return (
      <Centered>
        <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
          We couldn&apos;t set up your developer workspace. Refresh the page, or
          try again shortly.
        </p>
      </Centered>
    );
  }

  return <>{children}</>;
};

/**
 * Wraps the parts of the portal that need an account.
 *
 * The docs, the reference and the sandbox are all readable signed out — a
 * sign-in wall in front of them turns away the reader before they have seen
 * what they would be signing up for. Only real keys need an account, so only
 * real keys ask for one, and this says so where it is asked.
 */
const SignedInGate = ({ children }: { children: React.ReactNode }) => {
  const sessionQuery = useSession();

  if (sessionQuery.isLoading) {
    return (
      <Centered>
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </Centered>
    );
  }

  if (!sessionQuery.data?.user) {
    return (
      <Centered>
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Sign in to see your keys
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Keys belong to an account, so this is the one part of the portal
            that needs one. The docs, the API reference and the sandbox stay
            open either way.
          </p>
          <Link
            href={`${ROUTES.SIGN_IN}?redirectTo=${ROUTES.DEVELOPERS_KEYS}`}
            className={buttonVariants()}
          >
            Sign in
          </Link>
        </div>
      </Centered>
    );
  }

  return <WorkspaceGate>{children}</WorkspaceGate>;
};

export default SignedInGate;
