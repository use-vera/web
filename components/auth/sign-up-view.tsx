"use client";

import AuthField from "@/components/auth/auth-field";
import AuthHeader from "@/components/auth/auth-header";
import Button from "@/components/ui/button";
import { AUTH_COPY, type AuthRole } from "@/lib/auth-roles";
import { useRegister } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface SignUpViewProps {
  onSuccess: () => void;
  /** Modal use: swap the panel in place. */
  onSwitchToSignIn?: () => void;
  /** Page use: the sign-in page for this role. */
  switchToSignInHref?: string;
  role?: AuthRole;
  className?: string;
  /** Slot under the form, for the other role's entrance. */
  footer?: React.ReactNode;
}

const SignUpView = ({
  onSuccess,
  onSwitchToSignIn,
  switchToSignInHref,
  role = "attendee",
  className,
  footer,
}: SignUpViewProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const copy = AUTH_COPY[role]["sign-up"];
  const register = useRegister();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await register.mutateAsync({ fullName, email, password });
      onSuccess();
    } catch {
      toast.error("Couldn't create your account. Try a different email.");
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
          label="Full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Your name"
          required
          minLength={2}
        />

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
          placeholder="At least 8 characters"
          required
          minLength={8}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          type="submit"
          disabled={register.isPending}
          className="w-full justify-center rounded-lg"
        >
          {register.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {copy.action}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          {switchToSignInHref ? (
            <Link
              href={switchToSignInHref}
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Sign in
            </Link>
          ) : (
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="font-semibold text-foreground underline underline-offset-2"
            >
              Sign in
            </button>
          )}
        </p>
      </div>

      {footer}
    </form>
  );
};

export default SignUpView;
