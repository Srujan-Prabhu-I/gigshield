"use client"

import { useState } from "react"
import { Loader2, ShieldCheck, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    sendOtp,
    verifyCode,
  } = useAuth()

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!authModalOpen) return null

  const onSendOtp = async () => {
    setLoading(true)
    const ok = await sendOtp({
      email: email.trim(),
    })
    if (ok) setOtpSent(true)
    setLoading(false)
  }

  const onVerifyOtp = async () => {
    if (!otp.trim()) return
    setLoading(true)
    const ok = await verifyCode({
      email: email.trim(),
      token: otp.trim(),
    })
    if (ok) {
      setOtp("")
      setOtpSent(false)
      closeAuthModal()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#151515] p-6 md:p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3fe56c]/30 bg-[#3fe56c]/10 px-3 py-1 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#3fe56c]" />
              <span className="text-[10px] tracking-widest font-bold text-[#3fe56c] uppercase">Verify Identity</span>
            </div>
            <h3 className="text-white text-xl font-black tracking-tight">Better Protection</h3>
            <p className="text-neutral-400 text-sm mt-1">
              Verify with OTP for trusted reports and profile safeguards.
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-neutral-500 hover:text-white transition-colors"
            aria-label="Close auth modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-12 rounded-xl border border-neutral-800 bg-[#101010] px-4 text-white focus:outline-none focus:border-[#3fe56c]"
          />

          {otpSent ? (
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full h-12 rounded-xl border border-neutral-800 bg-[#101010] px-4 text-white focus:outline-none focus:border-[#3fe56c]"
            />
          ) : null}
        </div>

        <div className="mt-5 space-y-2">
          {!otpSent ? (
            <Button
              onClick={onSendOtp}
              disabled={loading || !email.trim()}
              className="w-full h-12 rounded-xl bg-[#3fe56c] hover:bg-[#37cf61] text-black font-extrabold"
            >
              {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
              Send OTP
            </Button>
          ) : (
            <>
              <Button
                onClick={onVerifyOtp}
                disabled={loading || !otp.trim()}
                className="w-full h-12 rounded-xl bg-[#3fe56c] hover:bg-[#37cf61] text-black font-extrabold"
              >
                {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
                Verify OTP
              </Button>
              <button
                onClick={onSendOtp}
                disabled={loading}
                className="w-full text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
              >
                Resend OTP
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

