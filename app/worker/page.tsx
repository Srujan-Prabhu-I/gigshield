"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Calculator, ScrollText, BarChart3, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function WorkerDashboard() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const [personalDeficit, setPersonalDeficit] = useState(0)
  const [isExploited, setIsExploited] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)

  // Protect route - redirect if not worker role
  useEffect(() => {
    if (!loading && (!user || role !== "worker")) {
      router.push("/")
    }
  }, [user, role, loading, router])

  // Fetch worker's latest earnings data
  useEffect(() => {
    if (!user?.id) return
    
    const fetchData = async () => {
      setDataLoading(true)
      try {
        const { data: latestLog, error } = await supabase
          .from("earnings_logs")
          .select("deficit")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()
        
        if (!error && latestLog) {
          setPersonalDeficit(latestLog.deficit || 0)
          setIsExploited((latestLog.deficit || 0) > 0)
        }
      } catch (err) {
        console.error("Failed to fetch earnings data:", err)
      } finally {
        setDataLoading(false)
      }
    }
    
    fetchData()
  }, [user?.id])

  if (loading || !user || role !== "worker") {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#3fe56c] animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Mocked platform marketplace data (since we don't have enough DB entries to aggregate fully yet)
  const platforms = [
    { name: "Swiggy", type: "Food Delivery", avgPay: 85, minWage: 120, status: "Severe", score: 42, features: [false, true, false] },
    { name: "Zomato", type: "Food Delivery", avgPay: 92, minWage: 120, status: "Moderate", score: 65, features: [true, true, false] },
    { name: "Uber", type: "Ride Hailing", avgPay: 145, minWage: 120, status: "Fair", score: 88, features: [true, true, true] },
    { name: "Rapido", type: "Ride Hailing", avgPay: 65, minWage: 120, status: "Severe", score: 31, features: [false, false, false] },
    { name: "Urban Company", type: "Home Services", avgPay: 180, minWage: 120, status: "Fair", score: 92, features: [true, true, true] },
    { name: "Zepto", type: "Quick Commerce", avgPay: 78, minWage: 120, status: "Severe", score: 39, features: [false, true, false] },
  ]

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header & Personal Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
              Welcome back, Worker.
            </h1>
            <p className="text-neutral-400 text-lg max-w-xl leading-relaxed">
              Your centralized hub to track your true earnings, compare platform policies, and protect your gig rights.
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Link href="/worker/checker">
                <button className="bg-[#3fe56c] hover:bg-[#37cf61] text-black font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(63,229,108,0.2)] active:scale-95 flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Check Today's Pay
                </button>
              </Link>
              <Link href="/worker/grievance">
                <button className="bg-[#1c1b1b] hover:bg-[#201f1f] border border-neutral-800 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-[#ff7162]" /> File Grievance
                </button>
              </Link>
            </div>
          </div>

          {/* Personal Alert Widget */}
          <div className={`rounded-3xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden border ${isExploited ? 'bg-[#2a0808] border-[#ff7162]/30' : 'bg-[#1c1b1b] border-neutral-800'}`}>
            {isExploited ? (
              <>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <AlertTriangle className="w-32 h-32 text-[#ff7162]" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-[#ff7162] mb-3">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold tracking-widest text-[11px] uppercase">Wage Theft Detected</span>
                  </div>
                  <h3 className="text-4xl font-black text-white mb-1 tracking-tighter">₹{Math.floor(personalDeficit).toLocaleString()}</h3>
                  <p className="text-neutral-300 font-medium text-sm leading-relaxed mb-5">
                    Estimated monthly deficit based on your recent activity. You are being underpaid.
                  </p>
                  <Link href="/worker/rights">
                    <button className="text-[11px] font-bold tracking-widest text-white uppercase bg-[#ff7162]/20 hover:bg-[#ff7162]/30 px-4 py-2 rounded-lg transition-colors">
                      Know Your Rights
                    </button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="absolute -right-4 -bottom-4 opacity-5">
                  <CheckCircle2 className="w-32 h-32 text-[#3fe56c]" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-[#3fe56c] mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold tracking-widest text-[11px] uppercase">Status Healthy</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">You're Protected</h3>
                  <p className="text-neutral-400 font-medium text-sm leading-relaxed mb-5">
                    We haven't detected significant wage theft in your recent logs. Keep tracking daily to assure compliance.
                  </p>
                  <Link href="/worker/checker">
                    <button className="text-[11px] font-bold tracking-widest text-[#3fe56c] uppercase bg-[#002108] hover:bg-[#00341a] px-4 py-2 rounded-lg transition-colors border border-[#00c853]/20">
                      Log New Shift
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Platform Marketplace */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                Platform Marketplace <span className="bg-[#1c1b1b] text-[10px] text-[#3fe56c] px-3 py-1 rounded-full border border-[#3fe56c]/20 tracking-wider uppercase">Live</span>
              </h2>
              <p className="text-neutral-400 font-medium text-sm">Real-time gig economy data across India. Compare who pays fairly.</p>
            </div>
            <Link href="/worker/exploitation">
              <button className="text-xs font-bold text-neutral-300 hover:text-white flex items-center transition-colors">
                View Full Index <BarChart3 className="w-4 h-4 ml-1.5" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {platforms.map((platform, i) => (
              <div key={i} className="bg-[#131212] border border-neutral-800 rounded-[24px] p-6 hover:border-neutral-700 transition-colors flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{platform.name}</h3>
                    <p className="text-[11px] text-neutral-500 font-bold tracking-wider uppercase mt-1">{platform.type}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${
                    platform.status === 'Severe' ? 'bg-[#2a0808] text-[#ff7162] border-[#ff7162]/30' : 
                    platform.status === 'Fair' ? 'bg-[#002108] text-[#3fe56c] border-[#3fe56c]/30' : 
                    'bg-[#2d2100] text-[#f9a826] border-[#f9a826]/30'
                  }`}>
                    {platform.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#1c1b1b] rounded-xl p-4 border border-neutral-800/50">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Avg Pay/Hr</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-black text-white">₹{platform.avgPay}</p>
                      {platform.avgPay < platform.minWage && (
                        <TrendingDown className="w-4 h-4 text-[#ff7162]" />
                      )}
                    </div>
                  </div>
                  <div className="bg-[#1c1b1b] rounded-xl p-4 border border-neutral-800/50">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Our Score</p>
                    <p className={`text-2xl font-black ${
                      platform.score < 50 ? 'text-[#ff7162]' : platform.score >= 80 ? 'text-[#3fe56c]' : 'text-[#f9a826]'
                    }`}>{platform.score}/100</p>
                  </div>
                </div>

                <div className="space-y-3 mt-auto pt-4 border-t border-neutral-800/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400 font-medium flex items-center gap-2">Minimum Guarantee</span>
                    {platform.features[0] ? <CheckCircle2 className="w-4 h-4 text-[#3fe56c]" /> : <span className="text-neutral-600 font-bold text-xs">—</span>}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400 font-medium flex items-center gap-2">Grievance Portal</span>
                    {platform.features[1] ? <CheckCircle2 className="w-4 h-4 text-[#3fe56c]" /> : <span className="text-neutral-600 font-bold text-xs">—</span>}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400 font-medium flex items-center gap-2">Health Insurance</span>
                    {platform.features[2] ? <CheckCircle2 className="w-4 h-4 text-[#3fe56c]" /> : <span className="text-neutral-600 font-bold text-xs">—</span>}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
