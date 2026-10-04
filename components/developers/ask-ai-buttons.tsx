"use client";

import Button from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Copy } from "lucide-react";
import { useState } from "react";

interface AskAiButtonsProps {
  /** The page being read, e.g. "Sell tickets from your own site". */
  title: string;
  /** Absolute or site-relative URL of the page, handed to the assistant. */
  path: string;
  /** Plain-text rendering of the page, copied for pasting into a chat. */
  plainText: string;
}

/**
 * Hands the current page to an assistant.
 *
 * Both links open a chat pre-loaded with a prompt that points at this exact
 * page, because an assistant asked about "the Vera API" in the abstract will
 * invent endpoints. Pointing it at a URL it can read is the difference
 * between an answer and a plausible-looking guess.
 */
const AskAiButtons = ({ title, path, plainText }: AskAiButtonsProps) => {
  const [copied, setCopied] = useState(false);

  /* Resolved in the browser so the link carries the real host, including
     on a preview deploy where it is not the production domain. */
  const pageUrl =
    typeof window === "undefined"
      ? path
      : new URL(path, window.location.origin).toString();

  const prompt = `I'm integrating the Vera API. Read ${pageUrl} ("${title}") and help me implement it. Base your answer only on that page and the rest of the Vera docs — if something isn't covered there, say so rather than guessing.`;

  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  const copyPage = async () => {
    try {
      await navigator.clipboard.writeText(
        `${title}\n${pageUrl}\n\n${plainText}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard access can be refused outright (an insecure origin, or a
         browser that blocks it). The page is still readable; silently doing
         nothing is better than an error nobody can act on. */
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            {/* <Sparkles className="h-3.5 w-3.5" /> */}
            Ask AI
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-60">
        <DropdownMenuItem
          render={
            <a href={chatGptUrl} target="_blank" rel="noopener noreferrer" />
          }
          className="flex-col items-start gap-0.5"
        >
          <span>Ask ChatGPT</span>
          <span className="text-xs font-medium text-muted-foreground">
            Opens a chat about this page
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          render={
            <a href={claudeUrl} target="_blank" rel="noopener noreferrer" />
          }
          className="flex-col items-start gap-0.5"
        >
          <span>Ask Claude</span>
          <span className="text-xs font-medium text-muted-foreground">
            Opens a chat about this page
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void copyPage()}
          className="flex-col items-start gap-0.5"
        >
          <span className="flex items-center gap-1.5">
            {copied ? (
              <Check className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy page as text"}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            For pasting into any assistant
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AskAiButtons;
