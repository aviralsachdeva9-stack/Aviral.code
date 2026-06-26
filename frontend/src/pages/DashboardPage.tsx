import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { clearToken, getSavedEmail } from "../lib/auth"
import { reviewCode, getHistory, deleteHistoryItem, type HistoryItem } from "../lib/api"
import { MarkdownLite } from "../components/MarkdownLite"
import {
  BrainCircuit, Plus, History, LogOut, PanelLeft, X,
  SendHorizonal, Loader2, MessageSquare, Zap, Braces, Copy, Trash2
} from "lucide-react"

const LANGUAGES = [
  "python","javascript","typescript","java","c","c++","c#",
  "go","rust","ruby","php","swift","kotlin","r","sql",
  "bash","html","css","dart","scala",
]

const uid = () => Math.random().toString(36).slice(2, 10)

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

interface Msg { id: string; role: "user"|"assistant"; content: string; loading?: boolean }

const SUGGESTIONS = [
  { icon: "🔍", text: "Review my code for bugs and issues" },
  { icon: "⚡", text: "Generate a REST API with auth" },
  { icon: "🐛", text: "Debug this error in my code" },
  { icon: "💡", text: "Explain async/await with examples" },
  { icon: "🚀", text: "Optimize this function for speed" },
  { icon: "🏗️", text: "Design a scalable system architecture" },
]

async function streamIn(text: string, cb: (chunk: string) => void) {
  const chunks = text.match(/[\s\S]{1,6}/g) ?? [text]
  for (const c of chunks) { cb(c); await new Promise<void>(r => setTimeout(r, 7)) }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const email = getSavedEmail() ?? "user"

  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [language, setLanguage] = useState("python")
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [histLoading, setHistLoading] = useState(true)
  const [activeId, setActiveId] = useState<string|null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs])

  const resize = () => {
    const el = taRef.current; if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 200) + "px"
  }

  const loadHist = useCallback(async () => {
    try { setHistory(await getHistory()) } catch {} finally { setHistLoading(false) }
  }, [])
  useEffect(() => { loadHist() }, [loadHist])

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || busy) return
    const uid1 = uid(), uid2 = uid()
    setMsgs(p => [...p,
      { id: uid1, role: "user", content: msg },
      { id: uid2, role: "assistant", content: "", loading: true }
    ])
    setInput(""); if (taRef.current) taRef.current.style.height = "auto"
    setBusy(true); setActiveId(null)
    try {
      const res = await reviewCode(msg, language)
      setMsgs(p => p.map(m => m.id === uid2 ? { ...m, loading: false } : m))
      await streamIn(res, chunk => {
        setMsgs(p => p.map(m => m.id === uid2 ? { ...m, content: m.content + chunk } : m))
      })
      loadHist()
    } catch (e) {
      const err = e instanceof Error ? e.message : "Something went wrong"
      if (err.includes("401")) { clearToken(); navigate("/login"); return }
      setMsgs(p => p.map(m => m.id === uid2 ? { ...m, loading: false, content: `❌ **Error:** ${err}` } : m))
    } finally { setBusy(false) }
  }, [input, language, busy, loadHist, navigate])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleHistSelect = (item: HistoryItem) => {
    setMsgs([
      { id: uid(), role: "user", content: item.code_input },
      { id: uid(), role: "assistant", content: item.review_output }
    ])
    setLanguage(item.language); setActiveId(item.id); setSidebarOpen(false)
  }

  const isEmpty = msgs.length === 0

  return (
    <div className="app">
      {sidebarOpen && <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <BrainCircuit className="size-4" strokeWidth={2} />
            </div>
            <div className="sidebar-logo-text">
              <div className="sidebar-logo-name">Aviral.code</div>
              <div className="sidebar-logo-sub">AI Coding</div>
            </div>
          </div>
          <button className="sidebar-x" onClick={() => setSidebarOpen(false)}>
            <X className="size-4" />
          </button>
        </div>

        <button className="new-chat-btn" onClick={() => { setMsgs([]); setActiveId(null); setSidebarOpen(false) }}>
          <Plus className="size-4" /> New Chat
        </button>

        <div className="sidebar-section-label">
          <History className="size-3" /> History
        </div>

        <nav className="sidebar-hist">
          {histLoading ? (
            <div className="skel-wrap">
              {[1,2,3,4].map(i => <div key={i} className="skel" style={{ opacity: 1 - i * .18 }} />)}
            </div>
          ) : history.length === 0 ? (
            <div className="sidebar-empty">
              <MessageSquare className="size-6 mb-1" />
              <span>No chats yet</span>
            </div>
          ) : history.map(item => (
            <div key={item.id} className={`hist-item group relative ${activeId === item.id ? " active" : ""}`}>
              <button onClick={() => handleHistSelect(item)} className="w-full text-left" style={{ paddingRight: '28px' }}>
                <div className="hist-item-top">
                  <span className="hist-lang-tag">{item.language}</span>
                  <span className="hist-preview">{item.code_input.slice(0, 34).trim()}...</span>
                </div>
                <div className="hist-time">{timeAgo(item.created_at)}</div>
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await deleteHistoryItem(item.id);
                    setHistory(p => p.filter(h => h.id !== item.id));
                    if (activeId === item.id) { setActiveId(null); setMsgs([]); }
                  } catch (err: any) {
                    alert("Failed to delete: " + (err.message || String(err)));
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-red-500/70 hover:text-red-500 rounded bg-[#1e1e20]"
                title="Delete chat"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="s-avatar">{email[0].toUpperCase()}</div>
          <span className="s-email" title={email}>{email}</span>
          <button onClick={() => { clearToken(); navigate("/login") }} className="s-logout" title="Logout">
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="chat-main">
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="mob-menu" onClick={() => setSidebarOpen(true)}>
              <PanelLeft className="size-5" />
            </button>
            <div className="model-chip">
              <span className="online-dot" />
              Llama 3.3 70B · Groq
            </div>
          </div>
          <div className="topbar-right">
            <span className="lang-label"><Braces className="size-3.5 inline mr-1" />Language</span>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="lang-sel">
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Messages */}
        <div className="msgs-scroll">
          <div className="msgs-inner">
            {isEmpty ? (
              <div className="empty">
                <div className="empty-logo">
                  <BrainCircuit className="size-8" strokeWidth={1.5} />
                </div>
                <h1 className="empty-title">How can I help you code?</h1>
                <p className="empty-sub">
                  Ask me to review, generate, debug, or explain code. Select your language above and start a conversation.
                </p>
                <div className="suggestions">
                  {SUGGESTIONS.map(s => (
                    <button key={s.text} onClick={() => handleSend(s.text)} className="sugg-card">
                      <span className="sugg-icon">{s.icon}</span>
                      <span className="sugg-text">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : msgs.map(m => m.role === "user" ? (
              /* User message */
              <div key={m.id} className="msg-u">
                <div className="msg-u-inner">
                  <span className="msg-u-label">You</span>
                  <div className="msg-u-bubble">{m.content}</div>
                </div>
              </div>
            ) : (
              /* AI message */
              <div key={m.id} className="msg-ai">
                <div className="msg-ai-head">
                  <div className="msg-ai-avatar">
                    <Zap className="size-3.5" strokeWidth={2.5} />
                  </div>
                  <span className="msg-ai-name">Aviral.ai</span>
                  <span className="msg-ai-badge">Llama 3.3</span>
                  {!m.loading && (
                    <button
                      onClick={() => navigator.clipboard.writeText(m.content)}
                      className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
                      title="Copy response"
                    >
                      <Copy className="size-3.5" /> Copy
                    </button>
                  )}
                </div>
                <div className="msg-ai-box">
                  {m.loading ? (
                    <div className="typing-dots">
                      <div className="t-dot" /><div className="t-dot" /><div className="t-dot" />
                    </div>
                  ) : (
                    <MarkdownLite content={m.content} />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="input-zone">
          <div className="input-wrap">
            <textarea ref={taRef} value={input}
              onChange={e => { setInput(e.target.value); resize() }}
              onKeyDown={handleKeyDown}
              placeholder={`Ask Aviral.code anything about ${language}…`}
              className="chat-input" rows={1} disabled={busy}
            />
            <div className="input-bar-foot">
              <div className="input-hints">
                <span className="hint-text"><kbd>Enter</kbd> send &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> newline</span>
              </div>
              <button onClick={() => handleSend()} disabled={busy || !input.trim()} className="send-btn">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
              </button>
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#888", marginTop: "8px" }}>
            ai can make mistakes. Please verify important information.
          </div>
        </div>
      </div>
    </div>
  )
}
