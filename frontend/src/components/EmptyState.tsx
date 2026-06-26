import { Bug, ScanLine, Sparkles, type LucideIcon } from "lucide-react"
import type { Mode } from "@/lib/types"

interface Example {
  mode: Mode
  icon: LucideIcon
  title: string
  prompt: string
}

const EXAMPLES: Example[] = [
  {
    mode: "generate",
    icon: Sparkles,
    title: "Generate a hook",
    prompt: "Write a React hook that debounces a search input and cancels stale requests.",
  },
  {
    mode: "generate",
    icon: Sparkles,
    title: "Scaffold an API route",
    prompt: "Create a typed Express route that paginates results from a Postgres query.",
  },
  {
    mode: "review",
    icon: ScanLine,
    title: "Review for best practices",
    prompt: "Review this function for readability, edge cases, and performance:\n\nfunction sum(a,b){return a+b}",
  },
  {
    mode: "bugfix",
    icon: Bug,
    title: "Find the bug",
    prompt: "This component never re-renders when I add an item. What's wrong?\n\nitems.push(x); setItems(items)",
  },
]

interface EmptyStateProps {
  onPick: (mode: Mode, prompt: string) => void
}

export function EmptyState({ onPick }: EmptyStateProps) {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
        <Sparkles className="size-7 text-accent" />
      </div>
      <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Generate, review, and debug code
      </h1>
      <p className="mt-2 max-w-md text-pretty text-[15px] leading-relaxed text-muted">
        Your AI pair programmer. Pick a mode, drop in a prompt or some code, and get streamed,
        production-ready answers.
      </p>

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => onPick(ex.mode, ex.prompt)}
            className="group flex items-start gap-3 rounded-xl border border-border bg-surface/50 p-4 text-left transition-all hover:border-accent/40 hover:bg-surface"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted transition-colors group-hover:border-accent/40 group-hover:text-accent">
              <ex.icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">{ex.title}</span>
              <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-faint">
                {ex.prompt}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
