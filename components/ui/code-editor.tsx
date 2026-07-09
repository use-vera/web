"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  lang?: "json" | "bash" | "text";
  placeholder?: string;
  className?: string;
}

const TEXT_LAYER_CLASSES = "whitespace-pre p-3.5 font-mono text-xs leading-relaxed";

/**
 * A syntax-highlighted code input: a transparent, caret-visible textarea
 * stacked over a shiki-highlighted layer showing the same text. Scroll
 * position is synced manually since the two layers scroll independently.
 */
const CodeEditor = ({
  value,
  onChange,
  lang = "json",
  placeholder,
  className,
}: CodeEditorProps) => {
  const [html, setHtml] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      codeToHtml(value || " ", { lang, theme: "github-dark" })
        .then((result) => {
          if (!cancelled) setHtml(result);
        })
        .catch(() => {
          if (!cancelled) setHtml(null);
        });
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, lang]);

  const syncScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") return;
    event.preventDefault();

    const el = event.currentTarget;
    const { selectionStart, selectionEnd } = el;
    const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
    onChange(next);

    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = selectionStart + 2;
    });
  };

  return (
    <div
      className={cn(
        "relative max-w-full min-w-0 overflow-hidden rounded-sm border border-border bg-[#0d1117]",
        className,
      )}
    >
      {html ? (
        <div
          ref={highlightRef}
          aria-hidden
          className={cn(
            TEXT_LAYER_CLASSES,
            "pointer-events-none absolute inset-0 overflow-auto text-white/90 [&_pre]:m-0! [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:whitespace-pre! [&_pre]:font-mono! [&_pre]:text-xs! [&_pre]:leading-relaxed!",
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div
          ref={highlightRef}
          aria-hidden
          className={cn(
            TEXT_LAYER_CLASSES,
            "pointer-events-none absolute inset-0 overflow-auto text-white/90",
          )}
        >
          {value}
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        rows={10}
        className={cn(
          TEXT_LAYER_CLASSES,
          "relative h-56 w-full resize-none overflow-auto bg-transparent text-transparent caret-white outline-none placeholder:text-white/30",
        )}
      />
    </div>
  );
};

export default CodeEditor;
