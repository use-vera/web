"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentWorkspace } from "@/lib/hooks/use-workspace";
import { BookOpen, Key, TerminalSquare } from "lucide-react";
import Link from "next/link";

const QUICK_LINKS = [
  {
    href: "/developers/keys",
    icon: Key,
    title: "API keys",
    description:
      "Create and manage the keys your integration uses to call Vera.",
  },
  {
    href: "/developers/docs",
    icon: BookOpen,
    title: "Documentation",
    description: "Every endpoint, scope, and error code in the Vera API.",
  },
  {
    href: "/developers/sandbox",
    icon: TerminalSquare,
    title: "Sandbox",
    description:
      "Send real requests against your own key and see live responses.",
  },
];

const DevelopersOverviewPage = () => {
  const { workspace } = useCurrentWorkspace();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
        Build on Vera.
      </h1>
      <p className="mt-3 max-w-xl text-base text-muted-foreground">
        {workspace
          ? `You're working in ${workspace.name}. Create an API key, read the docs, and test calls in the sandbox.`
          : "Create an API key, read the docs, and test calls in the sandbox."}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="mt-2">{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>Three steps to your first API call.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-4 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                1
              </span>
              <span className="text-muted-foreground">
                <Link
                  href="/developers/keys"
                  className="font-semibold text-foreground underline underline-offset-2"
                >
                  Create an API key
                </Link>{" "}
                with the scopes your integration needs. Copy the secret key
                somewhere safe — it&apos;s shown only once.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                2
              </span>
              <span className="text-muted-foreground">
                Read the{" "}
                <Link
                  href="/developers/docs"
                  className="font-semibold text-foreground underline underline-offset-2"
                >
                  API documentation
                </Link>{" "}
                to see authentication, scopes, and every endpoint.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                3
              </span>
              <span className="text-muted-foreground">
                Paste your key into the{" "}
                <Link
                  href="/developers/sandbox"
                  className="font-semibold text-foreground underline underline-offset-2"
                >
                  Sandbox
                </Link>{" "}
                and send a real request to see it work.
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevelopersOverviewPage;
