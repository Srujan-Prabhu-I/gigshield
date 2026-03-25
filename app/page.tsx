"use client"

import Link from "next/link"
import { ChevronRight, Calculator, ScrollText, BarChart3, ShieldCheck } from "lucide-react"

export default function GigShieldHome() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white selection:bg-green-500/30 overflow-x-hidden font-sans pb-10">
      
      {/* HERO SECTION */}
      <section className="px-5 pt-12 pb-10 max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 mb-8 self-center">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-bold text-neutral-300 tracking-widest uppercase">Live across India</span>
        </div>

        <h1 className="text-[2.5rem] md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-5 text-white">
          15 Million Workers.<br />
          Zero Protection.<br />
          <span className="text-[#3fe56c]">Until Now.</span>
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-lg mx-auto mb-10 leading-relaxed">
          Empowering India's gig economy with data-driven protection. Reclaim underpaid wages and understand your rights against platform exploitation.
        </p>

        <div className="flex flex-col sm:flex-row w-full gap-4 max-w-md mx-auto justify-center">
          <Link href="/checker" className="w-full sm:w-auto">
            <button className="w-full bg-gradient-to-br from-[#3fe56c] to-[#00c853] hover:brightness-110 text-black font-extrabold text-[15px] sm:text-base py-4 sm:py-5 px-8 rounded-2xl transition-all shadow-[0_0_40px_rgba(0,200,83,0.3)] active:scale-95">
              Check Your Pay
            </button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <button className="w-full bg-[#1c1b1b] hover:bg-[#201f1f] text-neutral-100 font-bold text-[15px] sm:text-base py-4 sm:py-5 px-8 rounded-2xl transition-all border border-neutral-800 active:scale-95">
              View Impact Report
            </button>
          </Link>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="px-5 py-6 max-w-4xl mx-auto space-y-4">
        <div className="bg-[#1c1b1b] rounded-[24px] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group border border-neutral-800/50 hover:bg-[#201f1f] transition-colors">
          <div className="absolute -right-8 -bottom-10 text-[#0e0e0e] opacity-80 group-hover:scale-110 transition-transform duration-500">
            <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10h3v7H4zM10.5 10h3v7h-3zM2 19h20v3H2zM17 10h3v7h-3zM12 1L2 6v2h20V6L12 1z"/></svg>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#ff7162] uppercase mb-2">Exploitation Alert</p>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-2">₹12Cr+</h2>
            <p className="text-neutral-400 font-medium max-w-[200px] text-sm/relaxed">Underpaid Wages Detected Across India</p>
          </div>
        </div>

        <div className="bg-[#1c1b1b] rounded-[24px] p-6 md:p-8 border border-neutral-800/50 hover:bg-[#201f1f] transition-colors cursor-default">
          <h2 className="text-4xl md:text-5xl font-black text-[#3ce36a] tracking-tighter mb-2">20k+</h2>
          <p className="text-[10px] font-bold tracking-[0.1em] text-neutral-500 uppercase mb-4">Worker Reports Daily</p>
          <div className="flex -space-x-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1c1b1b] bg-neutral-800 flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 50}&backgroundColor=262626`} alt="Worker Avatar" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES (THE SENTINEL SUITE) */}
      <section className="px-5 pt-16 pb-12 max-w-4xl mx-auto">
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">The Sentinel Suite</h2>
          <p className="text-neutral-400 font-medium text-base md:text-lg max-w-md">Precision tools designed to shift the power dynamic back to the workers.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          
          <Link href="/checker" className="block group">
            <div className="bg-[#1c1b1b] hover:bg-[#201f1f] border border-neutral-800/50 rounded-[28px] p-8 transition-all h-full flex flex-col items-start active:scale-[0.98]">
              <div className="w-12 h-12 rounded-2xl bg-[#004c1b]/30 flex items-center justify-center mb-6 border border-[#00c853]/20">
                <Calculator className="w-6 h-6 text-[#3fe56c]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Fair Pay Checker</h3>
              <p className="text-neutral-400 text-sm/relaxed font-medium mb-8">Compare your earnings against industry standards and legal minimums to detect hidden algorithmic cuts.</p>
              <div className="mt-auto flex items-center text-[11px] font-bold tracking-widest text-[#3fe56c] uppercase">
                Analyze Now <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/grievance" className="block group">
            <div className="bg-[#1c1b1b] hover:bg-[#201f1f] border border-neutral-800/50 rounded-[28px] p-8 transition-all h-full flex flex-col items-start active:scale-[0.98]">
              <div className="w-12 h-12 rounded-2xl bg-[#68000b]/30 flex items-center justify-center mb-6 border border-[#ff7162]/20">
                <ScrollText className="w-6 h-6 text-[#ff7162]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Legal Rights Guide</h3>
              <p className="text-neutral-400 text-sm/relaxed font-medium mb-8">Auto-generate complaint letters based on simplified legal frameworks curated for Indian gig workers.</p>
              <div className="mt-auto flex items-center text-[11px] font-bold tracking-widest text-[#ff7162] uppercase">
                Learn Rights <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/index" className="block group md:col-span-2">
            <div className="bg-[#131313] md:bg-[#1c1b1b] hover:bg-[#1c1b1b] md:hover:bg-[#201f1f] border border-neutral-800/50 md:border-transparent md:hover:border-neutral-800/50 rounded-[28px] p-8 transition-all h-full flex flex-col md:flex-row md:items-center justify-between active:scale-[0.98]">
              <div className="mb-6 md:mb-0 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#00344b]/30 flex items-center justify-center mb-6 md:hidden border border-[#2fb9f9]/20">
                  <BarChart3 className="w-6 h-6 text-[#2fb9f9]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-[#2fb9f9] hidden md:block" />
                  Exploitation Index
                </h3>
                <p className="text-neutral-400 text-sm/relaxed font-medium md:mb-0 mb-6">Real-time ranking of platforms based on worker treatment, pay transparency, and safety.</p>
              </div>
              <div className="flex items-center text-[11px] font-bold tracking-widest text-[#2fb9f9] uppercase bg-[#001e2d] px-5 py-3 rounded-full shrink-0">
                View Rankings <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-16 max-w-4xl mx-auto">
        <div className="bg-[#131313] border border-neutral-800/50 rounded-[32px] p-8 md:p-12 text-center relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[50%] bg-[#00c853] opacity-5 blur-[100px] pointer-events-none rounded-full"></div>
          
          <ShieldCheck className="w-12 h-12 text-[#3ce36a] mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Stop Working<br />
            for Free.
          </h2>
          <p className="text-neutral-400 font-medium text-sm md:text-base max-w-[280px] md:max-w-md mx-auto mb-10 leading-relaxed">
            Join the movement for transparent gig work. GigShield is 100% free for workers, forever.
          </p>
          <Link href="/checker" className="inline-block w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-[#3fe56c] hover:bg-[#3ce36a] text-[#002108] font-extrabold text-[15px] sm:text-base py-5 px-10 rounded-full transition-transform active:scale-95 shadow-[0_10px_40px_rgba(63,229,108,0.2)]">
              PROTECT MY PAY
            </button>
          </Link>
        </div>
      </section>

    </div>
  )
}
