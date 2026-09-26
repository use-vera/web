import AuthPage from "@/components/auth/auth-page";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a Vera account to buy tickets and keep them in one place.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthPage role="attendee" view="sign-up" />
    </Suspense>
  );
}
