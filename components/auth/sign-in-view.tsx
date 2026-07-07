"use client";

import AuthField from "@/components/auth/auth-field";
import AuthHeader from "@/components/auth/auth-header";
import Button from "@/components/ui/button";
import { useLogin } from "@/lib/hooks/use-auth";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

interface SignInViewProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}

const SignInView = ({ onSuccess, onSwitchToSignUp }: SignInViewProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = useLogin();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      await login.mutateAsync({ email, password });
      onSuccess();
    } catch {
      setError("Couldn't sign you in. Check your email and password.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 pt-10">
      <AuthHeader
        title="Good to see you again."
        subtitle="Sign in to grab your ticket."
      />

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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-semibold text-foreground underline underline-offset-2"
          >
            Create one
          </button>
        </p>
      </div>
    </form>
  );
};

export default SignInView;
