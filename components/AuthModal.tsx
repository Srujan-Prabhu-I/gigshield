"use client"

import { useState } from "react"
import { Loader2, ShieldCheck, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    sendMagicLink,
  } = useAuth()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [linkSent, setLinkSent] = useState(false)

  if (!authModalOpen) return null

  const onSendMagicLink = async () => {
    setLoading(true)
    const ok = await sendMagicLink({
      email: email.trim(),
    })
    if (ok) setLinkSent(true)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#151515] p-6 md:p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3fe56c]/30 bg-[#3fe56c]/10 px-3 py-1 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#3fe56c]" />
              <span className="text-[10px] tracking-widest font-bold text-[#3fe56c] uppercase">Verify Identity</span>
            </div>
            <h3 className="text-white text-xl font-black tracking-tight">
              {linkSent ? "Verification Sent" : "Better Protection"}
            </h3>
            <p className="text-neutral-400 text-sm mt-1">
              {linkSent 
                ? "Check your email and click the login link to verify your identity."
                : "Verify with magic link for trusted reports and profile safeguards."
              }
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
          {!linkSent && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-12 rounded-xl border border-neutral-800 bg-[#101010] px-4 text-white focus:outline-none focus:border-[#3fe56c]"
            />
          )}
        </div>

        <div className="mt-5 space-y-2">
          {!linkSent ? (
            <Button
              onClick={onSendMagicLink}
              disabled={loading || !email.trim()}
              className="w-full h-12 rounded-xl bg-[#3fe56c] hover:bg-[#37cf61] text-black font-extrabold"
            >
              {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
              {loading ? "Sending..." : "Verify Identity"}
            </Button>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#3fe56c]/20 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-[#3fe56c]" />
              </div>
              <p className="text-sm text-neutral-300 font-bold">
                Check your email
              </p>
              <button
                onClick={() => {
                  setLinkSent(false)
                  setEmail("")
                }}
                disabled={loading}
                className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
              >
                Use different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

