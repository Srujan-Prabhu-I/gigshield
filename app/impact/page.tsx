"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { jsPDF } from "jspdf"

type LogItem = {
  platform: string
  city?: string
  hours_per_day?: number
  monthly_earnings?: number
  calculated_deficit?: number
  created_at?: string
}

type PlatformSummary = {
  platform: string
  workerCount: number
  avgDeficit: number
  avgEarnings: number
  compliance: string
}

export default function ImpactPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [targetWage, setTargetWage] = useState(93)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("earnings_logs")
        .select("platform, city, hours_per_day, monthly_earnings, calculated_deficit, created_at")

      if (error) {
        console.error("Failed to load earnings logs", error)
        setLoading(false)
        return
      }

      setLogs((data as LogItem[]) || [])
      setLoading(false)
    }

    load()
  }, [])

  const totalReports = logs.length
  const totalDeficit = useMemo(
    () => logs.reduce((sum, item) => sum + (item.calculated_deficit ?? 0), 0),
    [logs]
  )

  const groupByPlatform = useMemo(() => {
    const map: Record<string, { count: number; totalDeficit: number; totalEarnings: number }> = {}
    logs.forEach((log) => {
      const key = log.platform || "Unknown"
      if (!map[key]) map[key] = { count: 0, totalDeficit: 0, totalEarnings: 0 }
      map[key].count++
      map[key].totalDeficit += log.calculated_deficit ?? 0
      map[key].totalEarnings += log.monthly_earnings ?? 0
    })
    return Object.entries(map).map(([platform, v]) => ({
      platform,
      workerCount: v.count,
      avgDeficit: v.count ? v.totalDeficit / v.count : 0,
      avgEarnings: v.count ? v.totalEarnings / v.count : 0,
      compliance: v.count
        ? ((v.totalDeficit / (v.totalEarnings || 1)) * 100 < 10 ? "Compliant" : (v.totalDeficit / (v.totalEarnings || 1)) * 100 < 25 ? "Partially" : "Non-Compliant")
        : "Unknown",
    }))
  }, [logs])

  const mostExploitative = useMemo(() => {
    if (!groupByPlatform.length) return "N/A"
    return groupByPlatform
      .slice()
      .sort((a, b) => b.avgDeficit - a.avgDeficit)[0].platform
  }, [groupByPlatform])

  const insights = useMemo(() => {
    if (!logs.length) return "No insights available yet."

    const platformCityStats: Record<string, { totalDeficit: number; totalEarnings: number; count: number }> = {}
    logs.forEach((log) => {
      const platform = log.platform || "Unknown"
      const city = (log.city || "Unknown").trim()
      const key = `${platform}||${city}`
      if (!platformCityStats[key]) platformCityStats[key] = { totalDeficit: 0, totalEarnings: 0, count: 0 }
      platformCityStats[key].totalDeficit += Number(log.calculated_deficit) || 0
      platformCityStats[key].totalEarnings += Number(log.monthly_earnings) || 0
      platformCityStats[key].count += 1
    })
    const entries = Object.entries(platformCityStats).map(([key, value]) => {
      const [platform, city] = key.split("||")
      const avgDeficitPercent = value.totalEarnings ? (value.totalDeficit / value.totalEarnings) * 100 : 0
      return { platform, city, avgDeficitPercent }
    })
    const top = entries.sort((a, b) => b.avgDeficitPercent - a.avgDeficitPercent)[0]
    if (!top) return "No insights available yet."
    return `${top.platform} shows highest exploitation (${top.avgDeficitPercent.toFixed(1)}%) in ${top.city}`
  }, [logs])

  const platformTrend = useMemo(() => {
    const trendMap: Record<string, "improving" | "worsening" | "stable"> = {}

    const byPlatform = logs.reduce((acc, log) => {
      const platform = log.platform || "Unknown"
      if (!acc[platform]) acc[platform] = []
      if (log.created_at) acc[platform].push(log)
      return acc
    }, {} as Record<string, LogItem[]>)

    Object.entries(byPlatform).forEach(([platform, items]) => {
      items.sort((a, b) => Number(new Date(b.created_at || "")) - Number(new Date(a.created_at || "")))
      if (items.length < 2) {
        trendMap[platform] = "stable"
      } else {
        const latestDeficit = Number(items[0].calculated_deficit) || 0
        const previousDeficit = Number(items[1].calculated_deficit) || 0
        trendMap[platform] = latestDeficit > previousDeficit ? "worsening" : latestDeficit < previousDeficit ? "improving" : "stable"
      }
    })

    return trendMap
  }, [logs])

  const avgWeeklyHours = useMemo(() => {
    const hours = logs.reduce((sum, item) => sum + (item.hours_per_day ?? 0), 0)
    return logs.length ? (hours / logs.length) * 7 : 40
  }, [logs])

  const additionalMonthlyIncome = ((targetWage - 93) * avgWeeklyHours * 26) / 12
  const totalAnnualGain = (targetWage - 93) * avgWeeklyHours * 26 * totalReports
  const totalAnnualGainCrore = (totalAnnualGain / 10000000).toFixed(2)
  const taxGainCrore = ((totalAnnualGain * 0.12) / 10000000).toFixed(2)

  const createPDF = () => {
    const doc = new jsPDF()
    doc.text("GigShield Intelligence Report", 14, 20)
    doc.text(`Total reports: ${totalReports}`, 14, 30)
    doc.save("gigshield-intelligence-report.pdf")
  }

  const copySummary = () => {
    const text = `Total reports: ${totalReports}\nTotal underpaid deficit: ₹${totalDeficit.toFixed(0)}\nMost exploitative platform: ${mostExploitative}`
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-4 sm:p-6 lg:p-10 pb-28">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black">GigShield Intelligence Report</h1>
          <p className="text-neutral-300">Anonymous aggregate data for policy decisions</p>
        </div>

        {loading ? (
          <div className="text-center text-neutral-300">Loading data...</div>
        ) : !logs.length ? (
          <div className="text-center text-neutral-300">No data yet — be the first contributor</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-[#1c1b1b] border border-neutral-800">
                <CardContent>
                  <CardTitle className="text-sm text-neutral-400">Total Reports</CardTitle>
                  <p className="text-3xl font-bold">{totalReports}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1c1b1b] border border-neutral-800">
                <CardContent>
                  <CardTitle className="text-sm text-neutral-400">Total Underpaid Wages</CardTitle>
                  <p className="text-3xl font-bold">₹{totalDeficit.toFixed(0)}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1c1b1b] border border-neutral-800">
                <CardContent>
                  <CardTitle className="text-sm text-neutral-400">Most Exploitative</CardTitle>
                  <p className="text-2xl font-bold">{mostExploitative}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1c1b1b] border border-neutral-800">
                <CardContent>
                  <CardTitle className="text-sm text-neutral-400">Cities Covered</CardTitle>
                  <p className="text-2xl font-bold">{new Set(logs.map((item) => (item as any).city)).size || 0}</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-[#1c1b1b] border border-neutral-800 rounded-lg p-4">
              <p className="text-sm text-neutral-300 font-semibold">Key Insight</p>
              <p className="text-white mt-1">{insights}</p>
            </div>

            <Card className="bg-[#1c1b1b] border border-neutral-800">
              <CardHeader className="p-5">
                <CardTitle className="text-xl font-bold">What if minimum wage increases?</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span>Set target wage: ₹{targetWage}</span>
                  <input
                    type="range"
                    min={93}
                    max={120}
                    value={targetWage}
                    onChange={(e) => setTargetWage(Number(e.target.value))}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#131313] p-3 rounded-lg">
                    <p className="text-xs text-neutral-400">Additional monthly income / worker</p>
                    <p className="text-xl font-bold">₹{additionalMonthlyIncome.toFixed(0)}</p>
                  </div>
                  <div className="bg-[#131313] p-3 rounded-lg">
                    <p className="text-xs text-neutral-400">Total annual increase</p>
                    <p className="text-xl font-bold">₹{totalAnnualGainCrore} Cr</p>
                  </div>
                  <div className="bg-[#131313] p-3 rounded-lg">
                    <p className="text-xs text-neutral-400">Estimated tax revenue</p>
                    <p className="text-xl font-bold">₹{taxGainCrore} Cr</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1c1b1b] border border-neutral-800">
              <CardHeader className="p-5">
                <CardTitle className="text-xl font-bold">Platform Compliance Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-neutral-400 border-b border-neutral-700">
                    <tr>
                      <th className="py-2">Platform</th>
                      <th className="py-2">Worker count</th>
                      <th className="py-2">Avg deficit</th>
                      <th className="py-2">Compliance</th>
                      <th className="py-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupByPlatform.map((p) => (
                      <tr key={p.platform} className="border-b border-neutral-800">
                        <td className="py-2">{p.platform}</td>
                        <td className="py-2">{p.workerCount}</td>
                        <td className="py-2">₹{p.avgDeficit.toFixed(0)}</td>
                        <td className="py-2">{p.compliance}</td>
                        <td className="py-2">{platformTrend[p.platform] === "improving" ? "↑ improving" : platformTrend[p.platform] === "worsening" ? "↓ worsening" : "→ stable"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button onClick={createPDF} className="bg-gradient-to-br from-[#3fe56c] to-[#00c853] text-black">Download Full Intelligence Report</Button>
              <Button onClick={copySummary} className="border border-neutral-700">Share with Policy Makers</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
