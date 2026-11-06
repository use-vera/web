"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  lang?: "json" | "bash" | "text";
  className?: string;
  /**
   * Collapses anything past `maxLines` behind a "Show more" toggle. Off by
   * default: a documented example is written to be read whole, but an API
   * response is whatever the server sent, and a hundred events should not
   * push the rest of the page off the screen.
   */
  collapsible?: boolean;
  /** Lines shown while collapsed. Ignored unless `collapsible`. */
  maxLines?: number;
}

/** Roughly one line of the block's 14px/1.5 monospace type. */
const LINE_HEIGHT_REM = 1.3125;

const CodeBlock = ({
  code,
  lang = "json",
  className,
  collapsible = false,
  maxLines = 20,
}: CodeBlockProps) => {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const lineCount = code.split("\n").length;
  /* Only worth a toggle when it actually hides something. One or two lines
     past the limit is not worth a button. */
  const canCollapse = collapsible && lineCount > maxLines + 2;
  const isCollapsed = canCollapse && !expanded;

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
        "group relative overflow-hidden rounded-[20px] bg-[#16150F] text-sm",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => void handleCopy()}
        aria-label="Copy code"
        className="absolute top-3 right-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/70 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white focus-visible:opacity-100"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>

      <div
        className={cn("relative", isCollapsed && "overflow-hidden")}
        style={
          isCollapsed
            ? { maxHeight: `${maxLines * LINE_HEIGHT_REM + 2}rem` }
            : undefined
        }
      >
        {html ? (
          <div
            className="overflow-x-auto p-5 [&_pre]:bg-transparent! [&_pre]:p-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="overflow-x-auto p-5 text-white/90">
            <code>{code}</code>
          </pre>
        )}

      </div>

      {canCollapse ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-dashed border-white/15 py-2.5 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Show all {lineCount} lines
            </>
          )}
        </button>
      ) : null}
    </div>
  );
};

export default CodeBlock;
