import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { highlight } from "@/lib/highlight"

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const lines = code.replace(/\n$/, "").split("\n")

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-border bg-background/60">
      <div className="flex items-center justify-between border-b border-border bg-surface/60 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-danger/70" />
            <span className="size-2.5 rounded-full bg-warning/70" />
            <span className="size-2.5 rounded-full bg-accent/70" />
          </span>
          <span className="ml-1 font-mono text-xs text-muted">{language || "code"}</span>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-accent" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="min-w-full py-3 font-mono text-[13px] leading-relaxed">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex px-1">
                <span className="w-10 shrink-0 select-none pr-4 text-right text-faint/60">
                  {i + 1}
                </span>
                <span className="flex-1 whitespace-pre pr-4">
                  {line ? highlight(line) : "\u00A0"}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
