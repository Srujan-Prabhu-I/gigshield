"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Search, Building2, TrendingUp, ShieldCheck, Loader2, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type PlatformData = {
  name: string
  avgPay: number
  workers: number
  deficitRatio: number
  score: number
  status: string
}

export default function PlatformCompetitors() {
  const [platforms, setPlatforms] = useState<PlatformData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch all platform profiles (Primary Source)
      const { data: profiles, error: profileError } = await supabase
        .from("platform_profiles")
        .select("*")
        .order("compliance_score", { ascending: false })

      if (profileError) throw profileError

      // 2. Fetch all earnings logs to calculate REAL worker-reported metrics
      const { data: logs, error: logsError } = await supabase
        .from("earnings_logs")
        .select("platform, monthly_earnings, hours_per_day, calculated_deficit")

      if (logsError) throw logsError

      // 3. Aggregate log data per platform
      const logStats = (logs || []).reduce((acc, log) => {
        const p = log.platform || "Unknown"
        if (!acc[p]) acc[p] = { count: 0, totalDeficit: 0 }
        acc[p].count += 1
        acc[p].totalDeficit += Number(log.calculated_deficit) || 0
        return acc
      }, {} as Record<string, { count: number; totalDeficit: number }>)

      // 4. Merge and format
      const formatted: PlatformData[] = (profiles || []).map(p => {
        const stats = logStats[p.platform_name] || { count: 0, totalDeficit: 0 }
        const auditData = p.audit_data as any
        
        return {
          name: p.platform_name,
          avgPay: auditData?.avgPay || Number(p.base_pay_per_hour) || 0,
          workers: stats.count || p.worker_count || 0,
          deficitRatio: stats.count ? (stats.totalDeficit / (stats.count * 19285)) * 100 : 0,
          score: p.compliance_score || 0,
          status: auditData?.status || (p.compliance_score >= 75 ? "Compliant" : "Needs Review")
        }
      })

      setPlatforms(formatted)
    } catch (err) {
      console.error("Error fetching competitor data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const industryAvgPay = useMemo(() => 
    platforms.length > 0 ? Math.round(platforms.reduce((acc, p) => acc + p.avgPay, 0) / platforms.length) : 0
  , [platforms])

  const marketLeader = useMemo(() => 
    [...platforms].sort((a, b) => b.avgPay - a.avgPay)[0]
  , [platforms])

  const exploitationRisk = useMemo(() => 
    [...platforms].sort((a, b) => b.deficitRatio - a.deficitRatio)[0]
  , [platforms])

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 pb-28 animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#00344b]/30 p-2 rounded-lg border border-[#2fb9f9]/20">
                <Search className="w-5 h-5 text-[#2fb9f9]" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                Competitor Intelligence
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl pl-12">
              Live benchmarking of your platform&apos;s data against industry standards and anonymous worker reports.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-neutral-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="font-bold uppercase text-xs tracking-widest">Aggregating Global Metrics...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="bg-[#1c1b1b] border-neutral-800 rounded-2xl p-6">
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                   Industry Avg Pay <TrendingUp className="w-3 h-3 text-[#3fe56c]" />
                </p>
                <h3 className="text-3xl font-black text-white">₹{industryAvgPay}/hr</h3>
                <p className="text-[10px] text-neutral-400 mt-2">Target rate for worker retention</p>
              </Card>
              <Card className="bg-[#1c1b1b] border-neutral-800 rounded-2xl p-6">
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                   Market Leader <Building2 className="w-3 h-3 text-[#2fb9f9]" />
                </p>
                <h3 className="text-3xl font-black text-white">₹{marketLeader?.avgPay || 0}/hr</h3>
                <p className="text-[10px] text-[#2fb9f9] mt-2 font-bold uppercase">{marketLeader?.name || '---'}</p>
              </Card>
              <Card className="bg-[#1c1b1b] border-neutral-800 rounded-2xl p-6">
                <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                   Exploitation Risk <AlertTriangle className="w-3 h-3" />
                </p>
                <h3 className="text-3xl font-black text-red-500">{exploitationRisk?.name || '---'}</h3>
                <p className="text-[10px] text-red-400 mt-2 font-bold uppercase">{exploitationRisk?.deficitRatio.toFixed(1)}% Measured Wage Deficit</p>
              </Card>
            </div>

            <div className="bg-[#131212] border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1c1b1b] text-neutral-500 text-[10px] uppercase tracking-widest font-black">
                    <tr>
                      <th className="px-6 py-5">Rank</th>
                      <th className="px-6 py-5">Platform</th>
                      <th className="px-6 py-5">Reported Workers</th>
                      <th className="px-6 py-5">Avg Hourly Pay</th>
                      <th className="px-6 py-5">Verified Score</th>
                      <th className="px-6 py-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {platforms.map((p, index) => (
                      <tr key={p.name} className="hover:bg-[#1a1919] transition-colors group">
                        <td className="px-6 py-4 font-black text-neutral-600">#{index + 1}</td>
                        <td className="px-6 py-4">
                          <p className="font-black text-white uppercase text-base group-hover:text-[#2fb9f9] transition-colors">{p.name}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-neutral-300">{p.workers.toLocaleString()}</td>
                        <td className="px-6 py-4 text-white font-black">₹{p.avgPay}</td>
                        <td className="px-6 py-4">
                          <span className={`text-lg font-black ${p.score >= 75 ? 'text-[#3fe56c]' : p.score >= 50 ? 'text-yellow-400' : 'text-red-500'}`}>
                            {p.score}/100
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={p.score >= 75 ? 'border-[#3fe56c]/50 text-[#3fe56c]' : 'border-neutral-700 text-neutral-500'}>
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
