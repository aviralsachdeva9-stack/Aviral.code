import { useEffect, useRef } from "react"
import { ArrowUp, ChevronDown, Square } from "lucide-react"
import { LANGUAGES, MODE_META, type Mode } from "@/lib/types"
import { ModeSelector } from "./ModeSelector"

interface ComposerProps {
  mode: Mode
  onModeChange: (m: Mode) => void
  language: string
  onLanguageChange: (l: string) => void
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onStop: () => void
  busy: boolean
}

export function Composer({
  mode,
  onModeChange,
  language,
  onLanguageChange,
  value,
  onChange,
  onSubmit,
  onStop,
  busy,
}: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the textarea.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = Math.min(el.scrollHeight, 260) + "px"
  }, [value])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!busy && value.trim()) onSubmit()
    }
  }

  return (
    <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <ModeSelector value={mode} onChange={onModeChange} disabled={busy} />

          <label className="relative flex items-center">
            <span className="sr-only">Language</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              disabled={busy}
              className="appearance-none rounded-lg border border-border bg-background/60 py-1.5 pl-3 pr-8 font-mono text-xs text-muted transition-colors hover:text-foreground focus:border-accent/50 focus:outline-none disabled:opacity-50"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l} className="bg-surface text-foreground">
                  {l}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-faint" />
          </label>
        </div>

        <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface/70 p-2 transition-colors focus-within:border-accent/50">
          <textarea
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={MODE_META[mode].placeholder}
            className="max-h-[260px] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-relaxed text-foreground placeholder:text-faint focus:outline-none"
          />
          {busy ? (
            <button
              onClick={onStop}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-foreground transition-colors hover:bg-border"
              aria-label="Stop generating"
            >
              <Square className="size-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={!value.trim()}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Send"
            >
              <ArrowUp className="size-4.5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        <p className="mt-2 text-center font-mono text-[11px] text-faint">
          {MODE_META[mode].verb} · Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  )
}
