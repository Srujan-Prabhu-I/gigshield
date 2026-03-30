"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Truck, ShieldCheck, ArrowLeft, Loader2, Building2, Landmark } from "lucide-react"
import { toast } from "sonner"
import { signUpWithPassword, signInWithPassword, setUserRole } from "@/lib/supabase-auth"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type RoleType = "worker" | "platform" | "government"
type StepType = "select-role" | "enter-details"

function roleClass(role: RoleType) {
  if (role === "worker") return "bg-green-950 border-green-700 text-green-300"
  if (role === "platform") return "bg-purple-950 border-purple-700 text-purple-300"
  return "bg-amber-950 border-amber-700 text-amber-300"
}

export default function RegisterPage() {
  const router = useRouter()
  const { setRole } = useAuth()
  const [step, setStep] = useState<StepType>("select-role")
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null)
  const [platformName, setPlatformName] = useState("")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const selectRole = (role: RoleType) => {
    if (role === "platform" && !platformName.trim()) {
      setError("Platform name is required.")
      return
    }
    setSelectedRole(role)
    setStep("enter-details")
    setError("")
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRole || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      // 1. Sign up user
      let { data: authData, error: authError } = await signUpWithPassword(
        email.trim(), 
        password
      )
      
      if (authError) {
        // Special case: User already exists - try to sign them in with the password they provided
        // and update their role. This allows "re-registering" to change roles.
        if (authError.message?.toLowerCase().includes("user already registered") || authError.status === 400) {
          const { data: signInData, error: signInError } = await signInWithPassword(email.trim(), password)
          
          if (signInError) {
            console.error("Auto-sign-in failed for existing user:", signInError)
            setError("This email is already registered. Please login with your existing password to update your role.")
            setLoading(false)
            return
          }
          
          if (signInData?.user) {
            // Treat this as a successful "registration/role update"
            authData.user = signInData.user
          } else {
            setError("Account already exists. Please login.")
            setLoading(false)
            return
          }
        } else {
          console.error("Signup failed:", authError)
          setError(authError.message || "Failed to create account.")
          setLoading(false)
          return
        }
      }

      if (!authData.user) {
        setError("Account creation failed. Please try again.")
        setLoading(false)
        return
      }

      // 2. Assign role
      const { error: roleError } = await setUserRole(
        authData.user.id, 
        selectedRole, 
        selectedRole === "platform" ? platformName : undefined
      )
      
      if (roleError) {
        console.error("Role assignment failed:", roleError)
        const errorMsg = roleError.message || "Failed to assign role."
        toast.error(`Account created, but role assignment failed: ${errorMsg}`)
      } else {
        // Manually update role in context to prevent race conditions during redirect
        setRole(selectedRole)
      }

      toast.success("Registration successful!")
      
      // 3. Redirect to appropriate portal
      if (selectedRole === "worker") router.push("/worker")
      else if (selectedRole === "platform") router.push("/platform")
      else router.push("/govt")
      
    } catch (err) {
      console.error("Registration exception:", err)
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white px-4 py-8 md:py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl mx-auto">
        
        {step === "select-role" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3 mb-10">
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3fe56c]/10 border border-[#3fe56c]/20 shadow-[0_0_30px_rgba(63,229,108,0.15)]">
                  <ShieldCheck className="w-8 h-8 text-[#3fe56c]" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">Join GigShield</h1>
              <p className="text-neutral-400 text-lg">Select your role to create an account</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Worker Role */}
              <div className="rounded-2xl border bg-green-950/40 border-green-700/50 hover:bg-green-900/40 hover:border-green-500 transition-all p-6 flex flex-col group cursor-pointer" onClick={() => selectRole("worker")}>
                <Truck className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                <h2 className="text-green-400 font-bold text-xl">Gig Worker</h2>
                <p className="text-neutral-300 text-sm mt-2 mb-6">Check your pay, know your rights, file complaints, and track your history.</p>
                <div className="mt-auto px-4 py-2 text-center rounded-lg bg-green-600/20 text-green-300 font-semibold group-hover:bg-green-500 group-hover:text-black transition-colors">
                  Select
                </div>
              </div>

              {/* Platform Role */}
              <div className="rounded-2xl border bg-purple-950/40 border-purple-700/50 hover:bg-purple-900/40 transition-all p-6 flex flex-col group">
                <Building2 className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                <h2 className="text-purple-400 font-bold text-xl">Platform / Company</h2>
                <p className="text-neutral-300 text-sm mt-2 mb-4">Compliance audit, worker insights, and competitor benchmarking.</p>
                <input
                  type="text"
                  value={platformName}
                  onChange={(event) => setPlatformName(event.target.value)}
                  placeholder="Enter platform name"
                  className="h-11 rounded-xl border border-purple-800/50 bg-black/50 px-3 text-sm text-white focus:outline-none focus:border-purple-500 mb-4"
                />
                <Button onClick={() => selectRole("platform")} className="mt-auto bg-purple-600/20 hover:bg-purple-500 text-purple-300 hover:text-white border-none shadow-none">
                  Select Platform
                </Button>
              </div>

              {/* Govt Role */}
              <div className="rounded-2xl border bg-amber-950/40 border-amber-700/50 hover:bg-amber-900/40 hover:border-amber-500 transition-all p-6 flex flex-col group cursor-pointer" onClick={() => selectRole("government")}>
                <Landmark className="w-12 h-12 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
                <h2 className="text-amber-400 font-bold text-xl">Government Dept</h2>
                <p className="text-neutral-300 text-sm mt-2 mb-6">Worker data, complaints tracking, and systemic policy tools.</p>
                <div className="mt-auto px-4 py-2 text-center rounded-lg bg-amber-600/20 text-amber-300 font-semibold group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  Select
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-neutral-400 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-white hover:text-[#3fe56c] font-bold transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        )}

        {step === "enter-details" && selectedRole && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
            
            <button 
              onClick={() => { setStep("select-role"); setError("") }}
              className="mb-6 flex items-center text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to roles
            </button>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-2">Create Account</h1>
              <div className="flex items-center justify-center gap-2">
                <span className="text-neutral-400">Registering as</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${roleClass(selectedRole)}`}>
                  {selectedRole}
                  {selectedRole === "platform" && platformName && ` - ${platformName}`}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-[#131313] p-8 shadow-2xl backdrop-blur-xl">
              <form onSubmit={handleRegister} className="space-y-5">
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300 ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-12 rounded-xl border border-neutral-800 bg-black/50 px-4 text-white focus:outline-none focus:border-[#3fe56c] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300 ml-1">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-12 rounded-xl border border-neutral-800 bg-black/50 px-4 text-white focus:outline-none focus:border-[#3fe56c] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300 ml-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  className="w-full h-12 mt-4 rounded-xl bg-[#3fe56c] hover:bg-[#34d65e] text-black font-black text-lg shadow-[0_0_20px_rgba(63,229,108,0.2)] transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  Complete Registration
                </Button>
                
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
