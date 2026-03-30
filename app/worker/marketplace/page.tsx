"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { ArrowUp, ArrowDown, ShieldCheck, AlertTriangle } from "lucide-react"

type PlatformRate = {
  id?: number
  platform: string
  city: string
  pay_per_delivery: number | null
  has_insurance: boolean
  has_grievance_portal: boolean
  has_min_guarantee: boolean
  compliance_score: number
}

type ReportItem = {
  platform: string
  created_at: string
}

const CITY_OPTIONS = ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Secunderabad"]

const normalizePlatform = (name: string) => name.toLowerCase().replace(/\s+/g, "_")

export default function WorkerMarketplace() {
  const [platformRates, setPlatformRates] = useState<PlatformRate[]>([])
  const [reports, setReports] = useState<ReportItem[]>([])
  const [cityFilter, setCityFilter] = useState("Hyderabad")
  const [sortBy, setSortBy] = useState<"bestPay" | "bestBenefits" | "lowestExploitation">("bestPay")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // Fetch platform rates (primary data - required)
      try {
        const { data: platforms, error: platformError } = await supabase
          .from("platform_rates")
          .select("*")
          .eq("city", cityFilter)
        
        if (platformError) {
          console.warn("Platform rates fetch error:", platformError.message)
        }
        setPlatformRates((platforms as PlatformRate[]) || [])
      } catch (error) {
        console.error("Failed to load platform rates:", error)
        setPlatformRates([])
      }

      // Fetch earnings logs (secondary data - optional, won't block UI)
      try {
        const { data: logs, error: logsError } = await supabase
          .from("earnings_logs")
          .select("platform, created_at")
        
        if (logsError) {
          console.warn("Earnings logs fetch skipped:", logsError.message)
        }
        setReports((logs as ReportItem[]) || [])
      } catch (error) {
        console.warn("Earnings logs unavailable:", error)
        setReports([])
      }

      setLoading(false)
    }

    fetchData()
  }, [cityFilter])

  const enrichedPlatforms = useMemo(() => {
    if (!platformRates.length) return []
    const now = new Date()
    const last30 = new Date(now)
    last30.setDate(now.getDate() - 30)
    const prev30 = new Date(now)
    prev30.setDate(now.getDate() - 60)

    return platformRates
      .map((item) => {
        const platformName = item.platform
        const totalReports = reports.filter((r) => r.platform.toLowerCase() === platformName.toLowerCase()).length
        const recentReports = reports.filter((r) => {
          const date = new Date(r.created_at)
          return r.platform.toLowerCase() === platformName.toLowerCase() && date >= last30
        }).length
        const prevReports = reports.filter((r) => {
          const date = new Date(r.created_at)
          return r.platform.toLowerCase() === platformName.toLowerCase() && date >= prev30 && date < last30
        }).length

        let trend: "up" | "down" | "flat" = "flat"
        if (recentReports > prevReports) trend = "up"
        if (recentReports < prevReports) trend = "down"

        const hourlyEquivalent = item.pay_per_delivery ? Math.round(item.pay_per_delivery * 3.5) : null
        const exploitationLabel = item.compliance_score >= 65 ? "Fair" : item.compliance_score >= 45 ? "Concerning" : "Exploitative"

        return {
          ...item,
          totalReports,
          recentReports,
          trend,
          hourlyEquivalent,
          exploitationLabel,
        }
      })
      .sort((a, b) => {
        if (sortBy === "bestPay") {
          return (b.hourlyEquivalent || 0) - (a.hourlyEquivalent || 0)
        }
        if (sortBy === "bestBenefits") {
          const benefitsA = Number(a.has_insurance) + Number(a.has_grievance_portal) + Number(a.has_min_guarantee)
          const benefitsB = Number(b.has_insurance) + Number(b.has_grievance_portal) + Number(b.has_min_guarantee)
          return benefitsB - benefitsA
        }
        if (sortBy === "lowestExploitation") {
          return a.compliance_score - b.compliance_score
        }
        return 0
      })
  }, [platformRates, reports, sortBy])

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-4 lg:p-8 font-sans pb-24">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black">Find Your Best Platform</h1>
          <p className="text-neutral-400">See which platform pays the fairest in your city.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-neutral-300">City:</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-[#101010] border border-neutral-800 rounded-xl px-3 py-2"
            >
              {CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-neutral-300">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-[#101010] border border-neutral-800 rounded-xl px-3 py-2"
            >
              <option value="bestPay">Best Pay</option>
              <option value="bestBenefits">Best Benefits</option>
              <option value="lowestExploitation">Lowest Exploitation</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-neutral-400">Loading marketplace...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrichedPlatforms.map((platform) => {
              const payText = platform.pay_per_delivery ? `₹${platform.pay_per_delivery}/delivery avg` : "N/A"
              const hourly = platform.hourlyEquivalent ? `₹${platform.hourlyEquivalent}/hr` : "-"
              const hourlyColor = platform.hourlyEquivalent && platform.hourlyEquivalent >= 93 ? "text-[#3fe56c]" : "text-[#ff4444]"

              return (
                <div key={`${platform.platform}-${platform.city}`} className="rounded-2xl border border-neutral-800 bg-[#131313] p-6">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="text-lg font-bold tracking-tight uppercase">{platform.platform}</p>
                      <p className="text-xs text-neutral-400 uppercase tracking-widest">{platform.city}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-white font-bold">{platform.platform[0]}</div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-neutral-300">Pay rate: <span className="text-white font-semibold">{payText}</span></p>
                    <p className={`text-sm font-bold ${hourlyColor}`}>Hourly equivalent: {hourly}</p>
                    <p className="text-xs text-neutral-400">Based on platform benchmark data</p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-semibold">
                    <span className={platform.has_insurance ? "text-[#3fe56c]" : "text-neutral-400"}>Insurance {platform.has_insurance ? "✓" : "✗"}</span>
                    <span className={platform.has_grievance_portal ? "text-[#3fe56c]" : "text-neutral-400"}>Grievance {platform.has_grievance_portal ? "✓" : "✗"}</span>
                    <span className={platform.has_min_guarantee ? "text-[#3fe56c]" : "text-neutral-400"}>Min Guarantee {platform.has_min_guarantee ? "✓" : "✗"}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className={platform.compliance_score >= 65 ? "bg-[#3fe56c]/20 text-[#3fe56c]" : platform.compliance_score >= 45 ? "bg-[#f9a826]/20 text-[#f9a826]" : "bg-[#ff4444]/20 text-[#ff4444]"} style={{ padding: "0.25rem 0.5rem", borderRadius: "0.4rem", fontWeight: 700 }}>
                      {platform.exploitationLabel}
                    </span>
                    <span className="text-xs text-neutral-400">Score {platform.compliance_score}/100</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                    <p>Reports: {platform.totalReports} reports</p>
                    <p className="flex items-center gap-1">Trend: {platform.trend === "up" ? <ArrowUp className="w-3 h-3 text-[#3fe56c]" /> : platform.trend === "down" ? <ArrowDown className="w-3 h-3 text-[#ff4444]" /> : <span className="text-neutral-500">↔</span>} {platform.trend}</p>
                  </div>

                  <Link href={`/worker/checker?platform=${encodeURIComponent(platform.platform)}`} className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-xl border border-[#3fe56c]/30 bg-[#3fe56c]/10 py-2 text-xs text-[#3fe56c] font-semibold hover:bg-[#3fe56c]/20">
                    Check My Pay on {platform.platform} →
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
