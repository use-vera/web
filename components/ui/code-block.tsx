"use client";

import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  lang?: "json" | "bash" | "text";
  className?: string;
}

const CodeBlock = ({ code, lang = "json", className }: CodeBlockProps) => {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    codeToHtml(code, { lang, theme: "github-dark" })
      .then((result) => {
        if (!cancelled) {
          setHtml(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHtml(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-sm border border-border bg-[#0d1117] text-sm",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => void handleCopy()}
        aria-label="Copy code"
        className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/70 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>

      {html ? (
        <div
          className="overflow-x-auto p-4 [&_pre]:bg-transparent! [&_pre]:p-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto p-4 text-white/90">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

export default CodeBlock;
