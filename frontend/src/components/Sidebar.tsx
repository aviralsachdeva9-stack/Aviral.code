import { MessageSquare, Plus, Terminal, Trash2, X } from "lucide-react"
import type { Conversation } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SidebarProps {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  open: boolean
  onClose: () => void
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  open,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-surface/40 transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Terminal className="size-4.5" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">Aviral.code</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-faint">
                code assistant
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground md:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={onNew}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-surface"
          >
            <Plus className="size-4 text-accent" />
            New session
          </button>
        </div>

        <div className="mt-4 px-4 font-mono text-[10px] uppercase tracking-wider text-faint">
          History
        </div>
        <nav className="mt-1 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {conversations.length === 0 && (
            <p className="px-2 py-3 text-xs text-faint">No sessions yet.</p>
          )}
          {conversations.map((c) => {
            const active = c.id === activeId
            return (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  active ? "bg-surface-2 text-foreground" : "text-muted hover:bg-surface/80",
                )}
              >
                <button
                  onClick={() => onSelect(c.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <MessageSquare
                    className={cn("size-4 shrink-0", active ? "text-accent" : "text-faint")}
                  />
                  <span className="truncate">{c.title}</span>
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  className="shrink-0 rounded p-1 text-faint opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                  aria-label="Delete session"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )
          })}
        </nav>

        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-faint">
            <span className="size-2 rounded-full bg-accent animate-pulse-dot" />
            Connected to <span className="font-mono text-muted">/api</span>
          </div>
        </div>
      </aside>
    </>
  )
}
