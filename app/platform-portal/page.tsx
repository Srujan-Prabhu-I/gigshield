"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ShieldAlert, Sparkles } from "lucide-react"

type AuditResult = {
  score: number
  status: "Compliant" | "Partially Compliant" | "Non-Compliant"
  violations: string[]
  actionItems: string[]
  verified: boolean
}

export default function PlatformPortalPage() {
  const [platformName, setPlatformName] = useState("")
  const [avgPayPerDelivery, setAvgPayPerDelivery] = useState(0)
  const [accidentInsurance, setAccidentInsurance] = useState(false)
  const [grievancePortal, setGrievancePortal] = useState(false)
  const [minEarningsGuarantee, setMinEarningsGuarantee] = useState(false)
  const [weeklyHours, setWeeklyHours] = useState(0)
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [earningsLogs, setEarningsLogs] = useState<any[]>([])
  const [avgDeficitByPlatform, setAvgDeficitByPlatform] = useState<Record<string, number>>({})
  const [platformInsight, setPlatformInsight] = useState("")
  const [loadingLogs, setLoadingLogs] = useState(true)

  const canSubmit = platformName.trim().length > 0 && weeklyHours > 0

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true)
      const { data, error } = await supabase
        .from("earnings_logs")
        .select("platform,city,monthly_earnings,calculated_deficit")

      if (error) {
        console.error("Failed to fetch earnings logs", error)
        setLoadingLogs(false)
        return
      }

      const logs = (data || []) as any[]
      setEarningsLogs(logs)

      const stats = logs.reduce((acc, item) => {
        const platformKey = item.platform || "Unknown"
        if (!acc[platformKey]) {
          acc[platformKey] = { totalEarnings: 0, totalDeficit: 0, count: 0 }
        }
        acc[platformKey].totalEarnings += Number(item.monthly_earnings) || 0
        acc[platformKey].totalDeficit += Number(item.calculated_deficit) || 0
        acc[platformKey].count += 1
        return acc
      }, {} as Record<string, { totalEarnings: number; totalDeficit: number; count: number }>)

      const avg = Object.fromEntries(
        Object.entries(stats as Record<string, { totalEarnings: number; totalDeficit: number; count: number }>).map(([ap, s]) => [ap, s.count ? (s.totalDeficit / (s.totalEarnings || 1)) * 100 : 0])
      ) as Record<string, number>

      setAvgDeficitByPlatform(avg)
      setLoadingLogs(false)
    }

    fetchLogs()
  }, [])

  useEffect(() => {
    if (!auditResult || !platformName) return

    const platformDeficit = avgDeficitByPlatform[platformName] ?? null
    const insightText = platformDeficit !== null
      ? `Your platform shows ${platformDeficit.toFixed(1)}% wage deficit.`
      : "No platform-specific earnings_logs data yet."

    setPlatformInsight(insightText)
  }, [auditResult, platformName, avgDeficitByPlatform])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit) return

    setIsSubmitting(true)

    const body = {
      platform: platformName,
      avgPay: Number(avgPayPerDelivery) || 0,
      hasInsurance: accidentInsurance,
      hasGrievance: grievancePortal,
      hasMinGuarantee: minEarningsGuarantee,
      weeklyHours: Number(weeklyHours) || 0,
    }

    console.log("AUDIT PAYLOAD:", body)

    try {
      const res = await fetch("/api/platform-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      console.log("AUDIT RESULT:", data)

      if (!res.ok) throw new Error(data.error || "Failed platform audit")

      setAuditResult(data)
    } catch (error: any) {
      console.error("Platform audit failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const badgeDate = useMemo(() => new Date().toDateString(), [])

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl md:text-5xl font-black">Platform Compliance Portal</h1>
          <p className="text-neutral-300 text-lg">Verify your platform's compliance with Telangana Gig Workers Act 2025</p>
        </div>

        <Card className="border border-neutral-800 bg-[#1c1b1b] shadow-lg">
          <CardHeader className="border-b border-neutral-800 p-6">
            <CardTitle className="text-xl font-bold">Self Audit Tool</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-1 text-sm text-neutral-300">
                  Platform name
                  <input
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111] text-white placeholder-gray-400 border border-gray-700 focus:ring-2 focus:ring-[#3fe56c] h-12"
                    placeholder="Swiggy"
                    required
                  />
                </label>
                <label className="space-y-1 text-sm text-neutral-300">
                  Avg pay per delivery/km
                  <input
                    type="number"
                    step="0.01"
                    value={avgPayPerDelivery || ""}
                    onChange={(e) => setAvgPayPerDelivery(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#111] text-white placeholder-gray-400 border border-gray-700 focus:ring-2 focus:ring-[#3fe56c] h-12"
                    placeholder="80"
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <label className="flex items-center justify-between rounded-lg border border-neutral-700 bg-[#131313] p-3" htmlFor="accidentInsurance">
                  Accident insurance
                  <input
                    id="accidentInsurance"
                    type="checkbox"
                    checked={accidentInsurance}
                    onChange={(e) => setAccidentInsurance(e.target.checked)}
                    className="accent-[#3fe56c] scale-110"
                  />
                </label>
                <label className="flex items-center justify-between rounded-lg border border-neutral-700 bg-[#131313] p-3" htmlFor="grievancePortal">
                  Grievance portal
                  <input
                    id="grievancePortal"
                    type="checkbox"
                    checked={grievancePortal}
                    onChange={(e) => setGrievancePortal(e.target.checked)}
                    className="accent-[#3fe56c] scale-110"
                  />
                </label>
                <label className="flex items-center justify-between rounded-lg border border-neutral-700 bg-[#131313] p-3" htmlFor="minEarningsGuarantee">
                  Min earnings guarantee
                  <input
                    id="minEarningsGuarantee"
                    type="checkbox"
                    checked={minEarningsGuarantee}
                    onChange={(e) => setMinEarningsGuarantee(e.target.checked)}
                    className="accent-[#3fe56c] scale-110"
                  />
                </label>
              </div>

              <label className="space-y-1 text-sm text-neutral-300">
                Avg weekly working hours
                <input
                  type="number"
                  step="1"
                  value={weeklyHours || ""}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#111] text-white placeholder-gray-400 border border-gray-700 focus:ring-2 focus:ring-[#3fe56c] h-12"
                  placeholder="40"
                  required
                />
              </label>

              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full mt-2 py-3 h-12 cursor-pointer z-10 relative bg-[#3fe56c] text-black font-semibold hover:bg-[#37cf61] transition"
              >
                {isSubmitting ? "Analyzing compliance..." : "Run Self Audit"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!loadingLogs && earningsLogs.length === 0 ? (
          <div className="border border-neutral-800 rounded-lg p-4 text-center text-neutral-300">
            No data yet — be the first contributor
          </div>
        ) : null}

        {auditResult ? (
          <Card className="border border-neutral-800 bg-[#1c1b1b] shadow-lg">
            <CardHeader className="border-b border-neutral-800 p-6">
              <CardTitle className="text-xl font-bold">Audit Outcome</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-neutral-300">Score: {auditResult.score}/100</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Status:</span>
                  <span className={
                    auditResult.score > 75
                      ? "text-[#22c55e]"
                      : auditResult.score >= 40
                      ? "text-[#facc15]"
                      : "text-[#ef4444]"
                  }>
                    {auditResult.score > 75 ? "🟢 Compliant" : auditResult.score >= 40 ? "🟡 Partially Compliant" : "🔴 Non-Compliant"}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">Real-time platform insight</p>
                <p className="text-sm text-neutral-300">{platformInsight}</p>
              </div>

              <div>
                <p className="font-semibold mb-2">Violations</p>
                <ul className="list-disc ml-5 text-sm text-neutral-300">
                  {auditResult.violations.map((violation, idx) => {
                    const clause = violation.includes("accident insurance")
                      ? "Telangana Act Sec 12"
                      : violation.includes("grievance")
                      ? "Telangana Act Sec 8"
                      : violation.includes("minimum earnings")
                      ? "Telangana Act Sec 14"
                      : "Telangana Act Sec 20"
                    return (
                      <li key={idx}>
                        ❌ {violation} → Violation: {clause}
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-2">Fix Suggestions</p>
                <ol className="list-decimal ml-5 text-sm text-neutral-300">
                  {auditResult.actionItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ol>
              </div>

              {auditResult.verified && (
                <div className="rounded-lg border border-[#22c55e] bg-[#163e1e] p-3 mt-2">
                  <p className="text-sm font-bold text-[#22c55e]">🏆 GigShield Verified Fair Employer</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Build Worker Trust",
              desc: "Public compliance data attracts stable, satisfied delivery workers.",
              icon: Sparkles,
            },
            {
              title: "Regulatory Shield",
              desc: "Stay aligned with Telangana law and avoid penalties.",
              icon: ShieldAlert,
            },
            {
              title: "Attract Better Workers",
              desc: "High compliance scores make you a preferred platform.",
              icon: ShieldCheck,
            },
          ].map((card) => (
            <Card key={card.title} className="border border-neutral-800 bg-[#1c1b1b]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <card.icon className="w-5 h-5 text-[#3fe56c]" />
                  <h3 className="font-bold text-white">{card.title}</h3>
                </div>
                <p className="text-sm text-neutral-300">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
