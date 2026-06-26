import { Bug, ScanLine, Sparkles } from "lucide-react"
import { MODE_META, type Mode } from "@/lib/types"
import { cn } from "@/lib/utils"

const MODES: { id: Mode; icon: typeof Sparkles }[] = [
  { id: "generate", icon: Sparkles },
  { id: "review", icon: ScanLine },
  { id: "bugfix", icon: Bug },
]

interface ModeSelectorProps {
  value: Mode
  onChange: (mode: Mode) => void
  disabled?: boolean
}

export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Assistant mode"
      className="inline-flex items-center gap-1 rounded-xl border border-border bg-background/60 p-1"
    >
      {MODES.map(({ id, icon: Icon }) => {
        const active = id === value
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{MODE_META[id].label}</span>
          </button>
        )
      })}
    </div>
  )
}
