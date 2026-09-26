import AuthPage from "@/components/auth/auth-page";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Vera account to see your tickets and buy new ones.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthPage role="attendee" view="sign-in" />
    </Suspense>
  );
}
