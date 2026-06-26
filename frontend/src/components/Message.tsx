import { Bug, ScanLine, Sparkles, User } from "lucide-react"
import { MarkdownLite } from "./MarkdownLite"
import { MODE_META, type ChatMessage, type Mode } from "@/lib/types"
import { cn } from "@/lib/utils"

const MODE_ICON: Record<Mode, typeof Sparkles> = {
  generate: Sparkles,
  review: ScanLine,
  bugfix: Bug,
}

export function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  const ModeIcon = MODE_ICON[message.mode]

  return (
    <div className="animate-fade-up px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-3xl gap-3.5 sm:gap-4">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg border",
            isUser
              ? "border-border bg-surface text-muted"
              : "border-accent/30 bg-accent/10 text-accent",
          )}
        >
          {isUser ? <User className="size-4" /> : <ModeIcon className="size-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {isUser ? "You" : "Aviral.ai"}
            </span>
            {!isUser && (
              <span className="rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                {MODE_META[message.mode].label}
              </span>
            )}
            {message.demo && (
              <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-warning">
                demo
              </span>
            )}
          </div>

          {isUser ? (
            <div className="whitespace-pre-wrap rounded-xl border border-border bg-surface/60 px-3.5 py-2.5 text-[15px] leading-relaxed text-foreground/90">
              {message.content}
            </div>
          ) : (
            <div className="min-h-[1.25rem]">
              <MarkdownLite content={message.content} />
              {message.streaming && (
                <span className="caret-blink ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-accent" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
