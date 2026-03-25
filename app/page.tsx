import Link from "next/link"
import { ArrowRight, IndianRupee, Shield, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-500/30 font-sans">
      {/* 1. HERO SECTION */}
      <section className="px-4 py-20 md:py-32 max-w-5xl mx-auto flex flex-col items-center text-center space-y-10">
        <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-sm font-medium text-neutral-300">
          Telangana Gig Workers Act 2025 — Now Enforced By You
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
          15 Million Workers.<br />
          <span className="text-neutral-500">Zero Protection.</span><br />
          <span className="text-red-500">Until Now.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl">
          GigShield is India&apos;s first platform that makes gig worker exploitation visible, measurable, and legally actionable.
        </p>
        
        <div className="relative max-w-xl text-left bg-neutral-900 border-l-4 border-red-500 p-6 md:p-8 rounded-r-xl italic space-y-4 shadow-2xl">
          <p className="text-neutral-300 text-lg md:text-xl font-medium leading-relaxed">
            &quot;App sab decide karta hai — order, paisa, penalty. Sunwai ka koi system nahi.&quot;
          </p>
          <p className="text-neutral-500 text-sm font-semibold">
            — Swiggy Delivery Partner, Hyderabad
          </p>
        </div>
        
        <div className="space-y-4 pt-6 flex flex-col items-center">
          <Link href="/checker">
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold text-lg px-8 py-4 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-red-500/20 group">
              Check Your Pay Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <p className="text-xs font-medium text-neutral-600">
            Free. Anonymous. Takes 30 seconds.
          </p>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-neutral-900/80 border-y border-neutral-800/50">
        <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-neutral-800">
          <div className="pt-8 md:pt-0 space-y-2">
            <h3 className="text-4xl md:text-5xl font-black text-white">15M+</h3>
            <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider">Gig Workers in India</p>
          </div>
          <div className="pt-8 md:pt-0 space-y-2">
            <h3 className="text-4xl md:text-5xl font-black text-red-500">₹2,08,224</h3>
            <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider">Stolen per worker per year</p>
          </div>
          <div className="pt-8 md:pt-0 space-y-2">
            <h3 className="text-4xl md:text-5xl font-black text-white">0</h3>
            <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider">Tools existed before GigShield</p>
          </div>
        </div>
      </section>

      {/* 3. FEATURE CARDS */}
      <section className="px-4 py-20 md:py-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-8 flex flex-col h-full transition-colors group">
            <div className="w-12 h-12 bg-neutral-950 rounded-xl flex items-center justify-center mb-6 text-red-500 border border-neutral-800 group-hover:border-red-500/30 group-hover:bg-red-500/10 transition-colors">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Check Your Pay</h3>
            <p className="text-neutral-400 leading-relaxed mb-8 flex-grow">
              See exactly how much you&apos;re underpaid vs Telangana minimum wage law.
            </p>
            <Link href="/checker" className="mt-auto group/link flex items-center text-sm font-bold text-red-500">
              Calculate Now
              <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-8 flex flex-col h-full transition-colors group">
            <div className="w-12 h-12 bg-neutral-950 rounded-xl flex items-center justify-center mb-6 text-red-500 border border-neutral-800 group-hover:border-red-500/30 group-hover:bg-red-500/10 transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Exploitation Index</h3>
            <p className="text-neutral-400 leading-relaxed mb-8 flex-grow">
              Live crowd-sourced ranking of which platforms exploit workers most.
            </p>
            <Link href="/index" className="mt-auto group/link flex items-center text-sm font-bold text-red-500">
              View Index
              <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-8 flex flex-col h-full transition-colors group">
            <div className="w-12 h-12 bg-neutral-950 rounded-xl flex items-center justify-center mb-6 text-red-500 border border-neutral-800 group-hover:border-red-500/30 group-hover:bg-red-500/10 transition-colors">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Know Your Rights</h3>
            <p className="text-neutral-400 leading-relaxed mb-8 flex-grow">
              AI-generated rights in English, Hindi, Telugu. Shareable. Printable.
            </p>
            <Link href="/checker" className="mt-auto group/link flex items-center text-sm font-bold text-red-500">
              Get Rights
              <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="border-t border-neutral-800 py-12 px-4 text-center space-y-4">
        <h4 className="text-xl font-black text-white tracking-tight">GigShield <span className="text-neutral-500 font-medium">— Built for 15 million voices.</span></h4>
        <p className="text-sm font-medium text-neutral-600">
          Anonymous. No login. Always free for workers.
        </p>
      </footer>
    </div>
  )
}
