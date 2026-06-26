export type Mode = "generate" | "review" | "bugfix"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  /** The visible content (may include ```fenced``` code blocks). */
  content: string
  /** Mode that produced this message, used for badges/labels. */
  mode: Mode
  /** Language hint chosen by the user when sending. */
  language?: string
  /** True while the assistant message is still streaming in. */
  streaming?: boolean
  /** Set when the response came from the local demo fallback. */
  demo?: boolean
  createdAt: number
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
}

export const MODE_META: Record<
  Mode,
  { label: string; short: string; verb: string; placeholder: string; endpoint: string }
> = {
  generate: {
    label: "Generate",
    short: "Gen",
    verb: "Generate code",
    placeholder: "Describe what you want to build… e.g. “a debounced React hook for search input”",
    endpoint: "/api/generate",
  },
  review: {
    label: "Review",
    short: "Review",
    verb: "Review code",
    placeholder: "Paste the code you'd like reviewed for quality, style and best practices…",
    endpoint: "/api/review",
  },
  bugfix: {
    label: "Bug Fix",
    short: "Debug",
    verb: "Find & fix bugs",
    placeholder: "Paste buggy code. Describe the symptom if you have one…",
    endpoint: "/api/review",
  },
}

export const LANGUAGES = [
  "typescript",
  "javascript",
  "tsx",
  "python",
  "go",
  "rust",
  "java",
  "c++",
  "sql",
  "bash",
] as const
