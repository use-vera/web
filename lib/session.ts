import { cookies } from "next/headers";

/**
 * The Next.js BFF layer's own session cookie. It holds the real backend's
 * bearer token so the browser never sees it — the backend itself stays
 * Bearer-JWT-only and has no notion of cookies.
 */
const SESSION_COOKIE = "vera_session";

export interface Session {
  token: string;
  refreshToken: string;
}

export const getSession = async (): Promise<Session | null> => {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Session>;

    if (!parsed.token) {
      return null;
    }

    return { token: parsed.token, refreshToken: parsed.refreshToken ?? "" };
  } catch {
    return null;
  }
};

export const setSession = async (session: Session) => {
  const store = await cookies();

  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
};

export const clearSession = async () => {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
};
