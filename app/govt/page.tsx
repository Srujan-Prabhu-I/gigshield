"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, FileWarning, TrendingDown, Building2, ChevronRight, ScrollText, Clock, Loader2 } from "lucide-react"

export default function GovtDashboard() {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || role !== "govt")) {
      router.push("/")
    }
  }, [user, role, loading, router])

  if (loading || !user || role !== "govt") {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3fe56c] animate-spin" />
      </div>
    )
  }

  // Mock data for government dashboard
  const workerCount = 12450
  const complaintCount = 342
  const totalDeficit = 8500000
  const avgExploitationScore = 68
  const recentGrievances = []

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#68000b]/30 p-2 rounded-lg border border-[#ff7162]/20">
                <Building2 className="w-5 h-5 text-[#ff7162]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                National Compliance Center
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-2xl pl-12">
              Real-time oversight of India's gig economy. Monitor platform compliance, process worker grievances, and enforce the Platform Act.
            </p>
          </div>
          
          <Link href="/govt/policy">
            <button className="bg-[#1c1b1b] hover:bg-[#201f1f] border border-[#ff7162]/30 hover:border-[#ff7162] text-white text-sm font-bold py-2.5 px-5 rounded-lg transition-all flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-[#ff7162]" /> Generate Intel Report
            </button>
          </Link>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#131212] border border-neutral-800 rounded-[20px] p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-[#00344b]/30 p-2 rounded-lg border border-[#2fb9f9]/20">
                <Users className="w-5 h-5 text-[#2fb9f9]" />
              </div>
            </div>
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Registered Workers</p>
            <h3 className="text-3xl font-black text-white">{workerCount || 12450}</h3>
          </div>

          <div className="bg-[#131212] border border-neutral-800 rounded-[20px] p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-[#68000b]/30 p-2 rounded-lg border border-[#ff7162]/20">
                <ScrollText className="w-5 h-5 text-[#ff7162]" />
              </div>
            </div>
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Formal Complaints</p>
            <h3 className="text-3xl font-black text-white">{complaintCount || 342}</h3>
          </div>

          <div className="bg-[#131212] border border-neutral-800 rounded-[20px] p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-[#2d2100]/30 p-2 rounded-lg border border-[#f9a826]/20">
                <TrendingDown className="w-5 h-5 text-[#f9a826]" />
              </div>
            </div>
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Total Wage Theft Tracked</p>
            <h3 className="text-3xl font-black text-white">₹{(totalDeficit || 12500000).toLocaleString()}</h3>
          </div>

          <div className="bg-[#131212] border border-neutral-800 rounded-[20px] p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-[#002108]/30 p-2 rounded-lg border border-[#3fe56c]/20">
                <Building2 className="w-5 h-5 text-[#3fe56c]" />
              </div>
            </div>
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Non-Compliant Platforms</p>
            <h3 className="text-3xl font-black text-[#ff7162]">3 / 12</h3>
          </div>
        </div>

        {/* Deep Dive Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Grievances Feed */}
          <div className="bg-[#1c1b1b] border border-neutral-800 rounded-[24px] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#ff7162]" /> Recent Grievances
                </h3>
                <p className="text-neutral-500 text-xs mt-1">Latest formal complaints requiring review.</p>
              </div>
              <Link href="/govt/complaints" className="text-xs font-bold text-neutral-400 hover:text-white transition-colors">
                View All
              </Link>
            </div>
            <div className="divide-y divide-neutral-800 flex-1">
              {recentGrievances && recentGrievances.length > 0 ? (
                recentGrievances.map((g) => (
                  <div key={g.id} className="p-5 flex items-center justify-between hover:bg-[#201f1f] transition-colors">
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">{g.platform_name}</p>
                      <p className="text-xs font-medium text-neutral-500">Filed {new Date(g.created_at).toLocaleDateString()}</p>
                    </div>
                    {g.pdf_url ? (
                      <a href={g.pdf_url} target="_blank" rel="noopener noreferrer">
                        <button className="text-[10px] font-bold tracking-widest text-[#ff7162] uppercase bg-[#68000b]/30 hover:bg-[#68000b]/50 border border-[#ff7162]/20 px-3 py-1.5 rounded-md transition-colors">
                          View PDF
                        </button>
                      </a>
                    ) : (
                      <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">Processing</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-500 text-sm">No recent grievances found.</div>
              )}
            </div>
          </div>

          {/* Platform Compliance Status */}
          <div className="bg-[#1c1b1b] border border-neutral-800 rounded-[24px] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#2fb9f9]" /> Platform Watchlist
                </h3>
                <p className="text-neutral-500 text-xs mt-1">Platforms facing severe exploitation deficits.</p>
              </div>
              <Link href="/govt/compliance" className="text-xs font-bold text-neutral-400 hover:text-white transition-colors">
                View All
              </Link>
            </div>
            <div className="p-6 grid gap-4">
              {/* Mock Warning Cards for Dashboard Impact */}
              {[
                { name: "Rapido", score: 31, risk: "CRITICAL", trend: "+12% Complaints" },
                { name: "Zepto", score: 39, risk: "HIGH", trend: "+5% Deficit" },
                { name: "Swiggy", score: 42, risk: "MODERATE", trend: "-2% Deficit" }
              ].map((p, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${p.risk === 'CRITICAL' ? 'bg-[#2a0808]/50 border-[#ff7162]/30' : 'bg-[#131212] border-neutral-800'} transition-colors hover:border-neutral-600`}>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{p.name}</span>
                    <span className="text-xs font-medium text-neutral-500">{p.trend}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${p.risk === 'CRITICAL' ? 'text-[#ff7162]' : p.risk === 'HIGH' ? 'text-[#f9a826]' : 'text-[#2fb9f9]'}`}>{p.risk} RISK</span>
                    <span className="text-xl font-black text-white">{p.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
