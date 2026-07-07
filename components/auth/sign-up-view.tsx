"use client";

import AuthField from "@/components/auth/auth-field";
import AuthHeader from "@/components/auth/auth-header";
import Button from "@/components/ui/button";
import { useRegister } from "@/lib/hooks/use-auth";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

interface SignUpViewProps {
  onSuccess: () => void;
  onSwitchToSignIn: () => void;
}

const SignUpView = ({ onSuccess, onSwitchToSignIn }: SignUpViewProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const register = useRegister();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      await register.mutateAsync({ fullName, email, password });
      onSuccess();
    } catch {
      setError("Couldn't create your account. Try a different email.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 pt-10">
      <AuthHeader
        title="Create your account."
        subtitle="Takes a few seconds, then you can grab your ticket."
      />

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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-semibold text-foreground underline underline-offset-2"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
};

export default SignUpView;
