import type { ReactNode } from "react"

/**
 * A tiny, dependency-free syntax highlighter. It is intentionally lightweight
 * (good enough for chat code blocks) and language-agnostic with a shared
 * keyword set. Tokens are mapped to theme colors.
 */

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "switch", "case", "break", "continue", "new", "class", "extends", "super",
  "import", "from", "export", "default", "async", "await", "try", "catch",
  "finally", "throw", "typeof", "instanceof", "in", "of", "this", "void",
  "yield", "static", "public", "private", "protected", "interface", "type",
  "enum", "implements", "def", "elif", "lambda", "pass", "with", "as", "fn",
  "let", "mut", "pub", "use", "struct", "impl", "match", "func", "package",
  "select", "where", "join", "group", "order", "by", "true", "false", "null",
  "nil", "None", "True", "False", "and", "or", "not", "is",
])

type TokenType = "comment" | "string" | "number" | "keyword" | "function" | "punct" | "text"

const COLORS: Record<TokenType, string> = {
  comment: "text-faint italic",
  string: "text-accent",
  number: "text-warning",
  keyword: "text-danger",
  function: "text-foreground font-medium",
  punct: "text-muted",
  text: "text-foreground/90",
}

// Order matters: earlier patterns win.
const TOKEN_RE = new RegExp(
  [
    "(?<comment>\\/\\/[^\\n]*|#[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)",
    "(?<string>\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'|`(?:\\\\.|[^`\\\\])*`)",
    "(?<number>\\b\\d+(?:\\.\\d+)?\\b)",
    "(?<word>[A-Za-z_$][A-Za-z0-9_$]*)",
    "(?<punct>[{}()\\[\\].,;:=+\\-*/%<>!&|?^~]+)",
    "(?<ws>\\s+)",
    "(?<other>.)",
  ].join("|"),
  "g",
)

export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = []
  let match: RegExpExecArray | null
  let key = 0
  TOKEN_RE.lastIndex = 0

  while ((match = TOKEN_RE.exec(code)) !== null) {
    const g = match.groups!
    if (g.ws !== undefined) {
      out.push(g.ws)
      continue
    }
    let type: TokenType = "text"
    let value = match[0]

    if (g.comment !== undefined) type = "comment"
    else if (g.string !== undefined) type = "string"
    else if (g.number !== undefined) type = "number"
    else if (g.word !== undefined) {
      if (KEYWORDS.has(g.word)) type = "keyword"
      else {
        // function call heuristic: word immediately followed by "("
        const after = code[TOKEN_RE.lastIndex]
        type = after === "(" ? "function" : "text"
      }
    } else if (g.punct !== undefined) type = "punct"

    out.push(
      <span key={key++} className={COLORS[type]}>
        {value}
      </span>,
    )
  }

  return out
}
