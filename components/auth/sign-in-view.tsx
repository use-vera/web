"use client";

import AuthField from "@/components/auth/auth-field";
import AuthHeader from "@/components/auth/auth-header";
import Button from "@/components/ui/button";
import { AUTH_COPY, type AuthRole } from "@/lib/auth-roles";
import { useLogin } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface SignInViewProps {
  onSuccess: () => void;
  /** Modal use: swap the panel in place. */
  onSwitchToSignUp?: () => void;
  /** Page use: the sign-up page for this role. */
  switchToSignUpHref?: string;
  role?: AuthRole;
  className?: string;
  /** Slot under the form, for the other role's entrance. */
  footer?: React.ReactNode;
}

const SignInView = ({
  onSuccess,
  onSwitchToSignUp,
  switchToSignUpHref,
  role = "attendee",
  className,
  footer,
}: SignInViewProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const copy = AUTH_COPY[role]["sign-in"];
  const login = useLogin();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await login.mutateAsync({ email, password });
      onSuccess();
    } catch {
      toast.error("Couldn't sign you in. Check your email and password.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6 p-6 pt-10", className)}
    >
      <AuthHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="flex flex-col gap-4">
        <AuthField
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />

        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          minLength={8}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          type="submit"
          disabled={login.isPending}
          className="w-full justify-center rounded-lg"
        >
          {login.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {copy.action}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          {switchToSignUpHref ? (
            <Link
              href={switchToSignUpHref}
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Create one
            </Link>
          ) : (
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Create one
            </button>
          )}
        </p>
      </div>

      {footer}
    </form>
  );
};

export default SignInView;
