import { type CustomVisualizationProps, formatValue as mbFormatValue } from "@metabase/custom-viz";
import type { Settings } from "./types";

function formatValue(value: unknown, opts: { column: unknown }): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return String(mbFormatValue(value as any, opts as any));
  } catch {
    if (typeof value === "number") {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
    }
    return String(value ?? "—");
  }
}

type MarkdownToken =
  | { type: "bold"; content: string }
  | { type: "italic"; content: string }
  | { type: "strike"; content: string }
  | { type: "code"; content: string }
  | { type: "text"; content: string };

function parseInlineMarkdown(text: string): MarkdownToken[] {
  const tokens: MarkdownToken[] = [];
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|`(.+?)`)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", content: text.slice(last, match.index) });
    }
    if (match[2] !== undefined) tokens.push({ type: "bold", content: match[2] });
    else if (match[3] !== undefined) tokens.push({ type: "italic", content: match[3] });
    else if (match[4] !== undefined) tokens.push({ type: "strike", content: match[4] });
    else if (match[5] !== undefined) tokens.push({ type: "code", content: match[5] });
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    tokens.push({ type: "text", content: text.slice(last) });
  }

  return tokens;
}

function MarkdownLabel({ text, style }: { text: string; style: React.CSSProperties }) {
  const tokens = parseInlineMarkdown(text);
  return (
    <div style={style}>
      {tokens.map((token, i) => {
        if (token.type === "bold") return <span key={i} style={{ fontWeight: 700 }}>{token.content}</span>;
        if (token.type === "italic") return <span key={i} style={{ fontStyle: "italic" }}>{token.content}</span>;
        if (token.type === "strike") return <span key={i} style={{ textDecoration: "line-through" }}>{token.content}</span>;
        if (token.type === "code") return <span key={i} style={{ fontFamily: "monospace", opacity: 0.85 }}>{token.content}</span>;
        return <span key={i}>{token.content}</span>;
      })}
    </div>
  );
}

export function MetricCard({
  series,
  settings,
  width,
  height,
  colorScheme,
}: CustomVisualizationProps<Settings>) {
  // Defensive access: series/data/cols/rows may be absent during initialization
  const firstSeries = series?.[0];
  const col = firstSeries?.data?.cols?.[0];
  const value = firstSeries?.data?.rows?.[0]?.[0];

  const title = settings?.title ?? col?.display_name ?? col?.name ?? "";
  const subtitle = settings?.subtitle;
  const accentColor = settings?.accent_color || "var(--mb-color-brand)";
  const isDark = colorScheme === "dark";

  if (!width || !height) return null;

  const fontSize = Math.min(width / 6, height / 2.5, 72);
  const titleSize = Math.max(fontSize * 0.28, 13);
  const subtitleSize = Math.max(fontSize * 0.22, 11);

  const mutedColor = isDark
    ? "var(--mb-color-text-secondary, #aaa)"
    : "var(--mb-color-text-medium, #696e7b)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        gap: "0.3em",
        padding: "1em",
        boxSizing: "border-box",
        backgroundColor: isDark
          ? "var(--mb-color-bg-dark, #1c1c1c)"
          : "var(--mb-color-bg-white, #ffffff)",
      }}
    >
      {title ? (
        <MarkdownLabel
          text={title}
          style={{
            fontSize: titleSize,
            fontWeight: 600,
            color: mutedColor,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        />
      ) : null}
      <div
        style={{
          fontSize,
          fontWeight: 700,
          color: accentColor,
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        {formatValue(value, { column: col ?? {} })}
      </div>
      {subtitle ? (
        <MarkdownLabel
          text={subtitle}
          style={{
            fontSize: subtitleSize,
            fontWeight: 400,
            color: mutedColor,
            textAlign: "center",
            marginTop: "0.1em",
          }}
        />
      ) : null}
    </div>
  );
}
