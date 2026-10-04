import { DIAGRAMS } from "@/components/developers/doc-diagrams";
import CodeBlock from "@/components/ui/code-block";
import Image from "next/image";
import {
  headingId,
  type DocBlock,
  type Guide,
} from "@/lib/developer-docs/content";
import { ENDPOINTS, ERROR_CODES } from "@/lib/developer-docs/endpoints";
import { cn, ROUTES } from "@/lib/utils";
import {
  ArrowUpRight,
  Image as ImageIcon,
  Info,
  Lightbulb,
  PlayCircle,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

const withInlineCode = (body: string): ReactNode =>
  body.split("`").map((piece, index) =>
    index % 2 === 1 ? (
      <code
        key={index}
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
      >
        {piece}
      </code>
    ) : (
      <Fragment key={index}>{piece}</Fragment>
    ),
  );

const CALLOUT_STYLES = {
  tip: {
    icon: Lightbulb,
    wrap: "border-primary/25 bg-primary/5",
    mark: "text-primary",
  },
  note: {
    icon: Info,
    wrap: "border-border bg-muted/50",
    mark: "text-muted-foreground",
  },
  warning: {
    icon: TriangleAlert,
    wrap: "border-destructive/25 bg-destructive/5",
    mark: "text-destructive",
  },
} as const;

const Callout = ({
  tone,
  title,
  body,
}: Extract<DocBlock, { kind: "callout" }>) => {
  const style = CALLOUT_STYLES[tone];
  const Icon = style.icon;

  return (
    <div className={cn("flex gap-3 rounded-sm border p-4", style.wrap)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.mark)} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {withInlineCode(body)}
        </p>
      </div>
    </div>
  );
};

const Screenshot = ({
  alt,
  caption,
  ratio = "wide",
  src,
  width,
  height,
}: Extract<DocBlock, { kind: "image" }>) => (
  <figure className="flex flex-col gap-2">
    {src ? (
      <Image
        src={src}
        alt={alt}
        width={width ?? 1200}
        height={height ?? 700}
        className="w-full rounded-xl border border-border"
        /* Never above the fold on a guide page, and the first screen is
           prose, so these wait their turn. */
        loading="lazy"
      />
    ) : (
      /* A reserved slot, deliberately visible: a placeholder nobody can see
         is a placeholder nobody ever fills, and this alt text is the brief
         for whoever takes the shot. */
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center",
          ratio === "wide" ? "aspect-16/7" : "aspect-4/3",
        )}
      >
        <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
          {alt}
        </p>
      </div>
    )}
    {caption ? (
      <figcaption className="text-xs text-muted-foreground">
        {caption}
      </figcaption>
    ) : null}
  </figure>
);

const EndpointLinks = ({
  ids,
  title,
}: Extract<DocBlock, { kind: "endpoints" }>) => {
  const rows = ids
    .map((id) => ENDPOINTS.find((endpoint) => endpoint.id === id))
    .filter((endpoint) => endpoint !== undefined);

  if (!rows.length) {
    return null;
  }

  return (
    <div className="rounded-sm border border-border">
      <p className="border-b border-border px-4 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title ?? "Reference"}
      </p>
      <ul className="divide-y divide-border">
        {rows.map((endpoint) => (
          <li key={endpoint.id}>
            <Link
              href={`${ROUTES.DEVELOPERS_API}#${endpoint.id}`}
              className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <span className="w-14 shrink-0 font-mono text-[11px] font-bold text-muted-foreground">
                {endpoint.method}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                {endpoint.path}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Block = ({ block }: { block: DocBlock }) => {
  switch (block.kind) {
    case "heading":
      return (
        <h2
          id={headingId(block.text)}
          className="scroll-mt-24 pt-4 text-xl font-bold text-foreground"
        >
          {block.text}
        </h2>
      );

    case "text":
      return (
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {withInlineCode(block.body)}
        </p>
      );

    case "code":
      return (
        <div className="flex flex-col gap-2">
          {block.label ? (
            <p className="text-xs font-semibold text-muted-foreground">
              {block.label}
            </p>
          ) : null}
          <CodeBlock
            code={block.code}
            lang={block.lang as "json" | "bash" | "text"}
          />
        </div>
      );

    case "callout":
      return <Callout {...block} />;

    case "list":
      return (
        <ul className="flex flex-col gap-2">
          {block.items.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground"
            >
              <span
                aria-hidden
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-border"
              />
              <span>{withInlineCode(item)}</span>
            </li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <ol className="flex flex-col gap-5">
          {block.items.map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
                <p className="text-[15px] font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {withInlineCode(item.body)}
                </p>
                {item.code ? (
                  <CodeBlock
                    code={item.code.code}
                    lang={item.code.lang as "json" | "bash" | "text"}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      );

    case "table":
      return (
        <div className="overflow-hidden rounded-sm border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {block.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-4 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {block.rows.map((row) => (
                <tr key={row.join("|")} className="align-top">
                  {row.map((cell, index) => (
                    <td
                      key={index}
                      className={cn(
                        "px-4 py-3 leading-relaxed",
                        index === 0
                          ? "font-sans text-xs font-semibold whitespace-nowrap text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {withInlineCode(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "image":
      return <Screenshot {...block} />;

    case "endpoints":
      return <EndpointLinks {...block} />;

    case "link":
      return (
        <a
          href={block.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
            <PlayCircle className="h-4 w-4 text-primary" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-card-foreground">
              {block.title}
            </span>
            <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
              {block.body}
            </span>
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5" />
        </a>
      );

    case "diagram": {
      const Diagram = DIAGRAMS[block.name];
      return <Diagram />;
    }

    case "errorCodes":
      return (
        <div className="overflow-hidden rounded-sm border border-border">
          <ul className="divide-y divide-border">
            {ERROR_CODES.map((entry) => (
              <li key={entry.code} className="flex items-start gap-3 px-4 py-3">
                <span className="w-10 shrink-0 pt-0.5 font-mono text-xs font-bold text-muted-foreground">
                  {entry.status}
                </span>
                <div className="min-w-0">
                  <code className="font-mono text-xs font-semibold text-foreground">
                    {entry.code}
                  </code>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {entry.meaning}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
  }
};

const DocBlocks = ({ guide }: { guide: Guide }) => (
  <div className="flex flex-col gap-5 ">
    {guide.blocks.map((block, index) => (
      <Block key={index} block={block} />
    ))}
  </div>
);

export default DocBlocks;
