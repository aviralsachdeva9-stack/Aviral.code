import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { saveToken, saveEmail } from "../lib/auth"
import { sendOtp, verifyOtp } from "../lib/api"
import { BrainCircuit, ArrowRight, Loader2, KeyRound, Mail, ChevronLeft, Sparkles } from "lucide-react"

type Step = "email" | "otp"

export default function AuthPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState<string[]>(Array(8).fill(""))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleSendOtp = useCallback(async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address"); return
    }
    setError(""); setLoading(true)
    try {
      await sendOtp(email.trim())
      saveEmail(email.trim())
      setSuccess("OTP sent! Check your email.")
      setTimeout(() => { setSuccess(""); setStep("otp"); setTimeout(() => otpRefs.current[0]?.focus(), 80) }, 900)
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to send OTP") }
    finally { setLoading(false) }
  }, [email])

  const handleOtpChange = (i: number, val: string) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, "").slice(0, 8).split("")
      const next = [...otp]; digits.forEach((d, j) => { if (i + j < 8) next[i + j] = d }); setOtp(next)
      otpRefs.current[Math.min(i + digits.length, 7)]?.focus(); return
    }
    const d = val.replace(/\D/g, "").slice(-1)
    const next = [...otp]; next[i] = d; setOtp(next)
    if (d && i < 7) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[i]) { const n = [...otp]; n[i] = ""; setOtp(n) }
      else if (i > 0) { otpRefs.current[i - 1]?.focus(); const n = [...otp]; n[i - 1] = ""; setOtp(n) }
    } else if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus()
    else if (e.key === "ArrowRight" && i < 7) otpRefs.current[i + 1]?.focus()
  }

  const handleVerify = useCallback(async () => {
    const str = otp.join("")
    if (str.length < 8) { setError("Enter all 8 digits"); return }
    setError(""); setLoading(true)
    try {
      const data = await verifyOtp(email.trim(), str)
      saveToken(data.access_token)
      setSuccess("Access granted — entering Aviral.code...")
      setTimeout(() => navigate("/dashboard"), 900)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid OTP")
      setOtp(Array(8).fill("")); setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } finally { setLoading(false) }
  }, [email, navigate, otp])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Enter") step === "email" ? handleSendOtp() : handleVerify() }
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h)
  }, [step, handleSendOtp, handleVerify])

  return (
    <div className="auth-root">
      <div className="auth-mesh" />

      <div className="auth-card-outer animate-float-up">
        <div className="auth-card">
          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand-logo">
              <BrainCircuit className="size-5" strokeWidth={2} />
            </div>
            <div>
              <div className="auth-brand-name">Aviral.code</div>
              <div className="auth-brand-tagline">AI Coding Assistant</div>
            </div>
          </div>

          {/* Steps */}
          <div className="auth-steps">
            <div className={`step-pill ${step === "email" ? "active" : "done"}`}>
              <Mail className="size-3" /> Email
            </div>
            <div className="step-divider" />
            <div className={`step-pill ${step === "otp" ? "active" : ""}`}>
              <KeyRound className="size-3" /> Verify
            </div>
          </div>

          {step === "email" ? (
            <div className="animate-float-up">
              <h1 className="auth-heading">Sign in</h1>
              <p className="auth-sub">Enter your email — we'll send a one-time passcode instantly.</p>

              <div className="auth-field">
                <label className="auth-label" htmlFor="email-input">Email address</label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" />
                  <input id="email-input" type="email" placeholder="you@company.com"
                    value={email} onChange={(e) => { setEmail(e.target.value); setError("") }}
                    className="auth-input" autoFocus autoComplete="email" />
                </div>
              </div>

              <button onClick={handleSendOtp} disabled={loading} className="auth-cta">
                {loading
                  ? <><Loader2 className="size-4 animate-spin" /> Sending...</>
                  : <><Sparkles className="size-4" /> Send OTP <ArrowRight className="size-4" /></>}
              </button>
            </div>
          ) : (
            <div className="animate-float-up">
              <button onClick={() => { setStep("email"); setError(""); setOtp(Array(8).fill("")) }} className="auth-back-btn">
                <ChevronLeft className="size-3.5" /> Back
              </button>
              <h1 className="auth-heading">Enter your code</h1>
              <p className="auth-sub">
                8-digit OTP sent to <span className="auth-sub-em">{email}</span>
              </p>

              <div className="auth-otp-grid">
                {otp.map((digit, i) => (
                  <input key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type="text" inputMode="numeric" maxLength={8}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className={`otp-box${digit ? " filled" : ""}`}
                    placeholder="·"
                  />
                ))}
              </div>

              <button onClick={handleVerify} disabled={loading || otp.join("").length < 8} className="auth-cta">
                {loading
                  ? <><Loader2 className="size-4 animate-spin" /> Verifying...</>
                  : <><KeyRound className="size-4" /> Verify &amp; Enter</>}
              </button>
              <button onClick={handleSendOtp} className="auth-resend" disabled={loading}>
                Didn't receive it? Resend
              </button>
            </div>
          )}

          {error && <div className="auth-msg error animate-fade-in">{error}</div>}
          {success && <div className="auth-msg ok animate-fade-in">{success}</div>}
        </div>
      </div>
    </div>
  )
}
