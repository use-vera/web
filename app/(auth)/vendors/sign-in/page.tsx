import AuthPage from "@/components/auth/auth-page";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Merchant sign in",
  description: "Sign in to your Vera vendor workspace to manage orders, menu and payouts.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthPage role="merchant" view="sign-in" />
    </Suspense>
  );
}
