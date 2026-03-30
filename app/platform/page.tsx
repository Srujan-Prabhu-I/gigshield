"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, ShieldCheck, Download, TrendingUp, Search, AlertTriangle, Loader2, Gavel } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function PlatformDashboard() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  
  const [platformName, setPlatformName] = useState("Your Platform")
  const [complianceScore, setComplianceScore] = useState(0)
  const [pendingGrievances, setPendingGrievances] = useState(0)
  const [avgDeficit, setAvgDeficit] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || role !== "platform")) {
      router.push("/")
    }
  }, [user, role, loading, router])

  useEffect(() => {
    const fetchPlatformData = async () => {
      if (!user) return
      
      try {
        setDataLoading(true)
        
        // 1. Get platform name
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("platform_name")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle()
          
        if (roleData?.platform_name) {
          const name = roleData.platform_name
          setPlatformName(name)
          
          // 2. Get profile details (Score & Persistence)
          const { data: profile } = await supabase
            .from("platform_profiles")
            .select("compliance_score")
            .eq("platform_name", name)
            .limit(1)
            .maybeSingle()
            
          if (profile) {
            setComplianceScore(profile.compliance_score || 0)
          }

          // 3. Get Pending Grievance Count
          const { count } = await supabase
            .from("grievances")
            .select("*", { count: 'exact', head: true })
            .eq("platform", name)
            .eq("status", "pending")
          
          setPendingGrievances(count || 0)

          // 4. Calculate AVG Deficit from worker logs
          const { data: logs } = await supabase
            .from("earnings_logs")
            .select("calculated_deficit")
            .eq("platform", name)
          
          if (logs && logs.length > 0) {
            const total = logs.reduce((acc, curr) => acc + (Number(curr.calculated_deficit) || 0), 0)
            setAvgDeficit(Math.round(total / logs.length))
          }
        }
      } catch (err) {
        console.error("Failed to load platform data", err)
      } finally {
        setDataLoading(false)
      }
    }
    
    if (user && role === "platform") {
      fetchPlatformData()
    }
  }, [user, role])

  if (loading || dataLoading || !user || role !== "platform") {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3fe56c] animate-spin" />
      </div>
    )
  }

  const isCertified = complianceScore >= 75
  const badgeTitle = isCertified ? "GigShield Verified Fair Employer Status" : "Action Required to Achieve Certification"

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#00344b]/30 p-2 rounded-lg border border-[#2fb9f9]/20">
                <Building2 className="w-5 h-5 text-[#2fb9f9]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
                {platformName} HQ
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-2xl pl-12">
              Management Command Center. Monitor compliance and resolve worker disputes.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link href="/platform/audit">
              <button className="bg-[#3fe56c] hover:bg-[#37cf61] text-black text-sm font-bold py-2.5 px-6 rounded-lg transition-all shadow-[0_0_15px_rgba(63,229,108,0.2)]">
                Launch Audit
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Score Widget */}
          <div className="lg:col-span-2 space-y-8">
            <div className={`rounded-[32px] p-8 md:p-10 relative overflow-hidden border ${isCertified ? 'bg-[#002108] border-[#3fe56c]/30' : 'bg-neutral-900/40 border-neutral-800'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-20">
                {isCertified ? <ShieldCheck className="w-48 h-48 text-[#3fe56c]" /> : <AlertTriangle className="w-48 h-48 text-yellow-500" />}
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 w-full">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Compliance Rating</span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-2 flex items-baseline gap-2">
                    {complianceScore} <span className="text-xl md:text-3xl font-bold text-neutral-500">/ 100</span>
                  </h2>
                  <p className="text-lg font-medium text-neutral-300 max-w-md">
                    {badgeTitle}
                  </p>
                </div>
                
                <div className="md:text-right flex flex-col items-start md:items-end w-full md:w-auto pt-6 border-t md:border-t-0 border-neutral-800 md:border-l md:pl-8">
                   <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Live Status</p>
                   {isCertified ? (
                     <div className="bg-[#3fe56c]/10 border border-[#3fe56c]/30 text-[#3fe56c] font-black text-lg px-6 py-3 rounded-xl uppercase">
                       Verified Shield
                     </div>
                   ) : (
                     <div className="space-y-4 w-full">
                       <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-black text-lg px-6 py-3 rounded-xl uppercase">
                         Pending
                       </div>
                       <div className="bg-neutral-800 rounded-full h-1.5 w-full md:w-32">
                         <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${complianceScore}%` }}></div>
                       </div>
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#111] border border-neutral-800 p-6 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-2">Avg Worker Deficit</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-4xl font-black text-white">₹{avgDeficit}</h4>
                  <span className="text-sm font-bold text-neutral-500">/hr</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                    <p className="text-[10px] font-bold text-yellow-500 uppercase">Moderate Divergence</p>
                </div>
              </div>
              <div className="bg-[#111] border border-neutral-800 p-6 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-2">Legal Exposure</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-4xl font-black text-red-500">{pendingGrievances}</h4>
                  <span className="text-sm font-bold text-neutral-500">Disputes</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <p className="text-[10px] font-bold text-red-400 uppercase">Attention Required</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Center */}
          <div className="space-y-6">
            <Link href="/platform/competitors" className="block group">
              <div className="bg-[#1c1b1b] hover:bg-[#222121] border border-neutral-800 hover:border-[#2fb9f9]/40 p-6 rounded-2xl transition-all h-full">
                <Search className="w-6 h-6 text-[#2fb9f9] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-black text-white uppercase mb-1">Competitor Intel</h3>
                <p className="text-xs text-neutral-400">Industry pay standard benchmarking.</p>
              </div>
            </Link>

            <Link href="/platform/trends" className="block group">
              <div className="bg-[#1c1b1b] hover:bg-[#222121] border border-neutral-800 hover:border-[#3fe56c]/40 p-6 rounded-2xl transition-all h-full">
                <TrendingUp className="w-6 h-6 text-[#3fe56c] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-black text-white uppercase mb-1">Worker Supply</h3>
                <p className="text-xs text-neutral-400">Live retention and sentiment flow.</p>
              </div>
            </Link>

            <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl">
              <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Compliance Warning</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Gavel className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-xs text-neutral-300">Section 14 of the Telangana Act requires insurance filing by end of quarter.</p>
                </div>
                <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 text-[10px] font-black uppercase py-2 rounded-lg transition-colors">
                  Resolution Protocol
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
