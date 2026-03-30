"use client"

import { useState } from "react"
import { Loader2, ShieldCheck, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { signInWithPassword, fetchUserRole } from "@/lib/supabase-auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
  } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!authModalOpen) return null

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      const { data, error: loginError } = await signInWithPassword(email.trim(), password)
      
      if (loginError) {
        setError(loginError.message || "Invalid credentials.")
        setLoading(false)
        return
      }

      if (data?.user) {
        toast.success("Login successful.")
        closeAuthModal()
        // Wait briefly for auth context to update
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (err) {
      setError("An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#151515] p-6 md:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3fe56c]/30 bg-[#3fe56c]/10 px-3 py-1 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#3fe56c]" />
              <span className="text-[10px] tracking-widest font-bold text-[#3fe56c] uppercase">Quick Login</span>
            </div>
            <h3 className="text-white text-xl font-black tracking-tight">
              Sign In to Continue
            </h3>
            <p className="text-neutral-400 text-sm mt-1">
              Please authenticate to use this feature.
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-neutral-500 hover:text-white transition-colors p-1"
            aria-label="Close auth modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-400 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 rounded-xl border border-neutral-800 bg-[#101010] px-4 text-white focus:outline-none focus:border-[#3fe56c] transition-colors"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-400 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 rounded-xl border border-neutral-800 bg-[#101010] px-4 text-white focus:outline-none focus:border-[#3fe56c] transition-colors"
            />
          </div>
        </div>
        
        {error ? (
          <div className="mt-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-medium text-center">
            {error}
          </div>
        ) : null}

        <div className="mt-6">
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#3fe56c] hover:bg-[#37cf61] text-black font-extrabold shadow-[0_0_15px_rgba(63,229,108,0.2)]"
          >
            {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
        
        <div className="mt-5 text-center">
          <p className="text-xs text-neutral-500">
            Don't have an account?{" "}
            <button 
              onClick={() => {
                closeAuthModal()
                router.push("/register")
              }} 
              className="text-[#3fe56c] hover:underline font-bold"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
