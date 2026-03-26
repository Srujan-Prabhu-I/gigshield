"use client"

import { ShieldCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function VerifyProtectionCTA() {
  const { user, mounted, openAuthModal } = useAuth()

  if (!mounted) return null

  if (user) {
    return (
      <div className="w-full rounded-2xl border border-[#3fe56c]/30 bg-[#10351b]/30 px-4 py-3 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#3fe56c] shrink-0" />
        <div>
          <p className="text-sm font-bold text-white">Verified account active</p>
          <p className="text-xs text-neutral-300">Your reports get better protection signals.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-neutral-800 bg-[#141414] px-4 py-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-bold text-white">Verify for Better Protection</p>
        <p className="text-xs text-neutral-400">Anonymous mode still works. Verification is optional.</p>
      </div>
      <Button
        onClick={openAuthModal}
        className="h-10 rounded-xl bg-[#3fe56c] hover:bg-[#37cf61] text-black font-extrabold text-xs px-4 shrink-0"
      >
        Verify
      </Button>
    </div>
  )
}

