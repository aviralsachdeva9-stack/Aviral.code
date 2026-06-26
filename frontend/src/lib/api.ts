import { getToken } from "./auth"

// Use environment variable for production API URL, fallback to relative path (Vite proxy) for local dev
const BASE = import.meta.env.VITE_API_URL || ""

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function sendOtp(email: string): Promise<void> {
  const res = await fetch(`${BASE}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to send OTP")
  }
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<{ access_token: string; user_id: string }> {
  const res = await fetch(`${BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Invalid OTP or expired")
  }
  return res.json()
}

// ── Review ────────────────────────────────────────────────────────────────────

export async function reviewCode(
  code: string,
  language: string,
): Promise<string> {
  const token = getToken()
  const res = await fetch(`${BASE}/api/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code, language }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Review failed")
  }
  const data = await res.json()
  return data.review as string
}

// ── History ───────────────────────────────────────────────────────────────────

export interface HistoryItem {
  id: string
  user_id: string
  language: string
  code_input: string
  review_output: string
  created_at: string
}

export async function getHistory(): Promise<HistoryItem[]> {
  const token = getToken()
  const res = await fetch(`${BASE}/api/history`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to fetch history")
  }
  const data = await res.json()
  return data.data as HistoryItem[]
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const token = getToken()
  const res = await fetch(`${BASE}/api/history/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to delete history")
  }
}
