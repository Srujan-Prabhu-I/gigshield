"use client"

import { ChevronRight, Calculator, ScrollText, BarChart3, ShieldCheck, User, Building2, Landmark } from "lucide-react"
import LiveCounter from "@/components/LiveCounter"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function GigShieldHome() {
  const { openAuthModal, user, role, loading, mounted } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to their role dashboard
  if (mounted && user && role) {
    const roleToPath: Record<string, string> = {
      worker: '/worker',
      platform: '/platform',
      govt: '/govt',
    }
    router.push(roleToPath[role] || '/worker')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#3fe56c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  const handleLogin = (portalRole: string) => {
    if (user && !role) {
      // Logged in but no role yet
      if (typeof window !== "undefined") localStorage.setItem("intendedRole", portalRole)
      router.push("/select-role")
    } else if (!user) {
      // Not logged in
      if (typeof window !== "undefined") localStorage.setItem("intendedRole", portalRole)
      openAuthModal()
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white selection:bg-green-500/30 overflow-x-hidden font-sans pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HERO SECTION */}
      <section className="px-5 pt-12 pb-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-[2.5rem] md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-5 text-white">
          The Ecosystem of <br />
          <span className="text-[#3fe56c]">Fair Work.</span>
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
          GigShield bridges the gap between gig workers, platforms, and policymakers to enforce fair wages and algorithmic transparency across India.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Worker Login Card */}
          <button onClick={() => handleLogin('worker')} className="group flex flex-col items-start bg-[#1c1b1b] hover:bg-[#201f1f] border border-neutral-800 hover:border-[#3fe56c]/50 rounded-[28px] p-8 text-left transition-all active:scale-[0.98] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-[#3fe56c]" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#004c1b]/30 flex items-center justify-center mb-6 border border-[#00c853]/20 group-hover:scale-110 transition-transform">
              <User className="w-7 h-7 text-[#3fe56c]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Worker Portal</h3>
            <p className="text-neutral-400 text-sm/relaxed font-medium mb-6">
              Compare platform pay, track deficits, and file formal grievances against unfair deactivations.
            </p>
            <div className="mt-auto text-[11px] font-bold tracking-widest text-[#3fe56c] uppercase">Secure Login</div>
          </button>

          {/* Platform Login Card */}
          <button onClick={() => handleLogin('platform')} className="group flex flex-col items-start bg-[#1c1b1b] hover:bg-[#201f1f] border border-neutral-800 hover:border-[#2fb9f9]/50 rounded-[28px] p-8 text-left transition-all active:scale-[0.98] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-[#2fb9f9]" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#00344b]/30 flex items-center justify-center mb-6 border border-[#2fb9f9]/20 group-hover:scale-110 transition-transform">
              <Building2 className="w-7 h-7 text-[#2fb9f9]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Platform Portal</h3>
            <p className="text-neutral-400 text-sm/relaxed font-medium mb-6">
              Access competitor intelligence, benchmark worker retention, and maintain compliance certifications.
            </p>
            <div className="mt-auto text-[11px] font-bold tracking-widest text-[#2fb9f9] uppercase">Secure Login</div>
          </button>

          {/* Govt Login Card */}
          <button onClick={() => handleLogin('govt')} className="group flex flex-col items-start bg-[#1c1b1b] hover:bg-[#201f1f] border border-neutral-800 hover:border-[#ff7162]/50 rounded-[28px] p-8 text-left transition-all active:scale-[0.98] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-[#ff7162]" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#68000b]/30 flex items-center justify-center mb-6 border border-[#ff7162]/20 group-hover:scale-110 transition-transform">
              <Landmark className="w-7 h-7 text-[#ff7162]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Govt Portal</h3>
            <p className="text-neutral-400 text-sm/relaxed font-medium mb-6">
              Review systemic exploitation data, process worker complaints, and enforce the 2025 Platform Act.
            </p>
            <div className="mt-auto text-[11px] font-bold tracking-widest text-[#ff7162] uppercase">Secure Login</div>
          </button>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="px-5 py-6 max-w-4xl mx-auto space-y-4">
        <div className="bg-[#1c1b1b] rounded-[24px] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group border border-neutral-800/50 hover:bg-[#201f1f] transition-colors">
          <div className="absolute -right-8 -bottom-10 text-[#0e0e0e] opacity-80 group-hover:scale-110 transition-transform duration-500">
            <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10h3v7H4zM10.5 10h3v7h-3zM2 19h20v3H2zM17 10h3v7h-3zM12 1L2 6v2h20V6L12 1z"/></svg>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#ff7162] uppercase mb-2">Platform Impact</p>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-2">₹12Cr+</h2>
            <p className="text-neutral-400 font-medium max-w-[200px] text-sm/relaxed">Underpaid Wages Tracked for Govt Intervention</p>
          </div>
        </div>

        <LiveCounter label="Protected Worker Profiles" suffix="+" />
      </section>

    </div>
  )
}
