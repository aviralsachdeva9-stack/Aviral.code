import { Fragment, type ReactNode } from "react"
import { CodeBlock } from "./CodeBlock"

interface MarkdownLiteProps {
  content: string
}

/** Renders a subset of markdown: fenced code, bold, inline code, headings, lists. */
export function MarkdownLite({ content }: MarkdownLiteProps) {
  const segments = splitFences(content)

  return (
    <div className="space-y-1">
      {segments.map((seg, i) =>
        seg.type === "code" ? (
          <CodeBlock key={i} code={seg.code} language={seg.lang} />
        ) : (
          <Prose key={i} text={seg.text} />
        ),
      )}
    </div>
  )
}

type Segment =
  | { type: "code"; code: string; lang?: string }
  | { type: "text"; text: string }

function splitFences(input: string): Segment[] {
  const segments: Segment[] = []
  const re = /```(\w+)?\n?([\s\S]*?)```/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(input)) !== null) {
    if (m.index > last) segments.push({ type: "text", text: input.slice(last, m.index) })
    segments.push({ type: "code", lang: m[1], code: m[2] })
    last = re.lastIndex
  }
  // Handle an unterminated (still-streaming) code fence.
  const rest = input.slice(last)
  const open = rest.indexOf("```")
  if (open !== -1) {
    if (open > 0) segments.push({ type: "text", text: rest.slice(0, open) })
    const after = rest.slice(open + 3)
    const nl = after.indexOf("\n")
    const lang = nl === -1 ? after.trim() || undefined : after.slice(0, nl).trim() || undefined
    const code = nl === -1 ? "" : after.slice(nl + 1)
    segments.push({ type: "code", lang, code })
  } else if (rest) {
    segments.push({ type: "text", text: rest })
  }

  return segments.filter((s) => (s.type === "text" ? s.text.trim() !== "" : true))
}

function Prose({ text }: { text: string }) {
  const lines = text.split("\n")
  const blocks: ReactNode[] = []
  let listBuffer: string[] = []

  const flushList = (key: string) => {
    if (!listBuffer.length) return
    blocks.push(
      <ul key={key} className="my-1.5 ml-1 space-y-1">
        {listBuffer.map((item, i) => (
          <li key={i} className="flex gap-2 text-[15px] leading-relaxed text-foreground/90">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
            <span>{inline(item)}</span>
          </li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  lines.forEach((raw, i) => {
    const line = raw.trimEnd()
    const listMatch = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/)
    if (listMatch) {
      listBuffer.push(listMatch[1])
      return
    }
    flushList(`ul-${i}`)

    if (line.startsWith("### ")) {
      blocks.push(
        <h4 key={i} className="mt-2 text-sm font-semibold text-foreground">
          {inline(line.slice(4))}
        </h4>,
      )
    } else if (line.startsWith("## ")) {
      blocks.push(
        <h3 key={i} className="mt-2 text-base font-semibold text-foreground">
          {inline(line.slice(3))}
        </h3>,
      )
    } else if (line.startsWith("# ")) {
      blocks.push(
        <h2 key={i} className="mt-3 text-base font-bold text-foreground border-b border-border pb-1">
          {inline(line.slice(2))}
        </h2>,
      )
    } else if (line.trim() === "") {
      blocks.push(<div key={i} className="h-1.5" />)
    } else {
      blocks.push(
        <p key={i} className="text-[15px] leading-relaxed text-foreground/90">
          {inline(line)}
        </p>,
      )
    }
  })
  flushList("ul-final")

  return <Fragment>{blocks}</Fragment>
}

/** Inline formatting: **bold** and `code`. */
function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[13px] text-accent"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}
