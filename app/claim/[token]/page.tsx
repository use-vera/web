import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Someone sent you a ticket · Vera",
  /* A claim link is personal; keep it out of search results. */
  robots: { index: false, follow: false },
};

/* Only the link's own characters reach the deep link. */
const safeToken = (value: string) => value.replace(/[^A-Za-z0-9_-]/g, "");

/**
 * Where a "someone sent you a ticket" email lands. The ticket is accepted in
 * the app, signed in with the email it was sent to, so this page only hands
 * over to the app.
 */
const ClaimTicketPage = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  const appLink = `vera://transfers/claim/${safeToken(token)}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center">
      <h1 className="text-4xl font-extrabold text-foreground">someone sent you a ticket.</h1>
      <p className="max-w-sm text-base text-muted-foreground">
        Open Vera to accept it and get your own entry code. Sign in, or sign up, with the email address this
        link was sent to.
      </p>
      <a
        href={appLink}
        className="rounded-full bg-foreground px-7 py-3 text-base font-bold text-background"
      >
        Open in Vera
      </a>
      <p className="max-w-xs text-sm text-muted-foreground">
        Don&apos;t have the app yet? Install Vera, then tap the link in your email again.
      </p>
    </main>
  );
};

export default ClaimTicketPage;
