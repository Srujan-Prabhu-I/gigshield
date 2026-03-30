"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { signInWithPassword, fetchUserRole } from "@/lib/supabase-auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const nextUrl = searchParams.get("next")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      const { data, error: loginError } = await signInWithPassword(email.trim(), password)
      
      if (loginError) {
        console.error("Login failed:", loginError)
        setError(loginError.message || "Invalid login credentials.")
        return
      }

      if (data?.user) {
        toast.success("Login successful.")
        
        // Fetch role to redirect appropriately
        const userRole = await fetchUserRole(data.user.id)
        
        if (nextUrl) {
          router.push(nextUrl)
        } else if (userRole === "worker") {
          router.push("/worker")
        } else if (userRole === "platform") {
          router.push("/platform")
        } else if (userRole === "govt" || userRole === "government") {
          router.push("/govt")
        } else {
          // Fallback if no role found
          router.push("/")
        }
      }
    } catch (err) {
      console.error("Login exception:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3fe56c]/10 mb-6 border border-[#3fe56c]/20 shadow-[0_0_30px_rgba(63,229,108,0.15)]">
            <ShieldCheck className="w-8 h-8 text-[#3fe56c]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Welcome Back</h1>
          <p className="text-neutral-400">Sign in to your GigShield account</p>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-[#131313] p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-300 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-12 rounded-xl border border-neutral-800 bg-black/50 px-4 text-white focus:outline-none focus:border-[#3fe56c] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-neutral-300">Password</label>
                  <Link href="#" className="text-xs text-[#3fe56c] hover:underline font-medium">Forgot password?</Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 rounded-xl border border-neutral-800 bg-black/50 px-4 text-white focus:outline-none focus:border-[#3fe56c] transition-colors"
                />
              </div>
            </div>

            {error ? (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium">
                {error}
              </div>
            ) : null}

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 rounded-xl bg-[#3fe56c] hover:bg-[#34d65e] text-black font-black text-lg shadow-[0_0_20px_rgba(63,229,108,0.2)] transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              Sign In
            </Button>
            
          </form>

          <div className="mt-8 text-center">
            <p className="text-neutral-400 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-white hover:text-[#3fe56c] font-bold transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
