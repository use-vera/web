import AuthPage from "@/components/auth/auth-page";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sell on Vera",
  description: "Create a vendor account to sell food, drinks and merch at events on Vera.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthPage role="merchant" view="sign-up" />
    </Suspense>
  );
}
