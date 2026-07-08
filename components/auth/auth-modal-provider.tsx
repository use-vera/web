"use client";

import AuthModal, { type AuthModalView } from "@/components/auth/auth-modal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface OpenAuthModalOptions {
  view?: AuthModalView;
  /** Where to send the user once they're signed in. Defaults to staying put. */
  redirectTo?: string;
}

interface AuthModalContextValue {
  openAuthModal: (options?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

/**
 * Picks up the `?auth=required&redirectTo=/tickets` query pair that proxy.ts
 * appends when it bounces an unauthenticated visitor off a guarded route, and
 * turns it into an auto-opened sign-in modal instead of a dead-end redirect.
 */
const AuthRedirectListener = ({
  openAuthModal,
}: {
  openAuthModal: (options?: OpenAuthModalOptions) => void;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("auth") !== "required") {
      return;
    }

    const redirectTo = searchParams.get("redirectTo") ?? undefined;
    openAuthModal({ view: "sign-in", redirectTo });

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("auth");
    nextParams.delete("redirectTo");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
};

export const AuthModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<AuthModalView>("sign-in");
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  const openAuthModal = useCallback((options?: OpenAuthModalOptions) => {
    setView(options?.view ?? "sign-in");
    setRedirectTo(options?.redirectTo);
    setOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setOpen(false);
    setRedirectTo(undefined);
  }, []);

  const handleAuthenticated = useCallback(() => {
    setOpen(false);

    if (redirectTo) {
      router.push(redirectTo);
    }

    setRedirectTo(undefined);
  }, [redirectTo, router]);

  const value = useMemo(
    () => ({ openAuthModal, closeAuthModal }),
    [openAuthModal, closeAuthModal],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <AuthRedirectListener openAuthModal={openAuthModal} />
      </Suspense>
      <AuthModal
        open={open}
        view={view}
        onViewChange={setView}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeAuthModal();
          }
        }}
        onAuthenticated={handleAuthenticated}
      />
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);

  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }

  return context;
};
