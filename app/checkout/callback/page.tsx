"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

const CheckoutCallbackPage = () => {
  useEffect(() => {
    const timeout = setTimeout(() => window.close(), 1200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <CheckCircle2 className="h-10 w-10 text-primary" />
      <h1 className="text-xl font-bold text-foreground">Payment received</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        You can close this tab — we&apos;re finishing up in the original
        window.
      </p>
    </main>
  );
};

export default CheckoutCallbackPage;
