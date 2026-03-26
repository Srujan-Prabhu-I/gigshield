"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ShieldAlert, Sparkles, Download, Award } from "lucide-react"

type AuditResult = {
  score: number
  status: "Compliant" | "Partially Compliant" | "Non-Compliant"
  violations: string[]
  actionItems: string[]
  verified: boolean
  estimatedPenalty?: number
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
  const [showCertification, setShowCertification] = useState(false)

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
        cache: "no-store",
      })

      const data = await res.json()
      console.log("AUDIT RESULT:", data)

      if (!res.ok) throw new Error(data.error || "Failed platform audit")

      setAuditResult(data)

      // Persistent Certification for High Scores
      if (data.score >= 75) {
        try {
          const { error: certError } = await supabase
            .from("platform_certifications")
            .insert([{
              platform_name: platformName,
              score: data.score,
              status: "Certified",
              created_at: new Date().toISOString()
            }])
          
          if (certError) {
            console.error("Failed to persist certification:", certError)
            // Silently continue if table doesn't exist yet
          } else {
            console.log("Certification persisted successfully")
          }
        } catch (e) {
          console.error("Certification persistence error:", e)
        }
      }
    } catch (error: any) {
      console.error("Platform audit failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadBadge = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Background
      ctx.fillStyle = '#1c1b1b'
      ctx.fillRect(0, 0, 400, 200)
      
      // Border glow
      ctx.strokeStyle = '#3fe56c'
      ctx.lineWidth = 3
      ctx.strokeRect(5, 5, 390, 190)
      
      // Shield icon
      ctx.fillStyle = '#3fe56c'
      ctx.font = '30px Arial'
      ctx.fillText('🛡️', 20, 40)
      
      // Title
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 18px Arial'
      ctx.fillText('GigShield Certified Fair Employer', 70, 35)
      
      // Platform name
      ctx.fillStyle = '#3fe56c'
      ctx.font = 'bold 24px Arial'
      ctx.fillText(platformName, 20, 80)
      
      // Score
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px Arial'
      ctx.fillText(`Score: ${auditResult?.score}/100`, 20, 110)
      
      // Date
      ctx.fillStyle = '#888'
      ctx.font = '14px Arial'
      ctx.fillText(`Verified: ${new Date().toLocaleDateString()}`, 20, 140)
      
      // Status
      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('✓ CERTIFIED', 20, 170)
      
      // Download
      const link = document.createElement('a')
      link.download = `${platformName}-gigshield-certification.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl md:text-5xl font-black">Platform Compliance Portal</h1>
          <p className="text-neutral-300 text-lg">Verify your platform's compliance with Telangana Gig Workers Act 2025</p>
        </div>

        <Card className="border border-neutral-800 bg-[#1c1b1b] shadow-lg">
          <CardHeader className="border-b border-neutral-800 p-6">
            <CardTitle className="text-xl font-bold text-white">Compliance Self-Audit Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-900/50 p-4 cursor-pointer hover:border-[#3fe56c]/30 transition-colors" htmlFor="accidentInsurance">
                  <span className="font-semibold text-neutral-200">Accident insurance</span>
                  <div className="relative flex items-center">
                    <input
                      id="accidentInsurance"
                      type="checkbox"
                      checked={accidentInsurance}
                      onChange={(e) => setAccidentInsurance(e.target.checked)}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-neutral-700 bg-neutral-800 transition-all checked:border-[#3fe56c] checked:bg-[#3fe56c]"
                    />
                    <ShieldCheck className="absolute h-4 w-4 text-black opacity-0 peer-checked:opacity-100 left-1 pointer-events-none" />
                  </div>
                </label>
                <label className="flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-900/50 p-4 cursor-pointer hover:border-[#3fe56c]/30 transition-colors" htmlFor="grievancePortal">
                  <span className="font-semibold text-neutral-200">Grievance portal</span>
                  <div className="relative flex items-center">
                    <input
                      id="grievancePortal"
                      type="checkbox"
                      checked={grievancePortal}
                      onChange={(e) => setGrievancePortal(e.target.checked)}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-neutral-700 bg-neutral-800 transition-all checked:border-[#3fe56c] checked:bg-[#3fe56c]"
                    />
                    <ShieldCheck className="absolute h-4 w-4 text-black opacity-0 peer-checked:opacity-100 left-1 pointer-events-none" />
                  </div>
                </label>
                <label className="flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-900/50 p-4 cursor-pointer hover:border-[#3fe56c]/30 transition-colors" htmlFor="minEarningsGuarantee">
                  <span className="font-semibold text-neutral-200">Min earnings guarantee</span>
                  <div className="relative flex items-center">
                    <input
                      id="minEarningsGuarantee"
                      type="checkbox"
                      checked={minEarningsGuarantee}
                      onChange={(e) => setMinEarningsGuarantee(e.target.checked)}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-neutral-700 bg-neutral-800 transition-all checked:border-[#3fe56c] checked:bg-[#3fe56c]"
                    />
                    <ShieldCheck className="absolute h-4 w-4 text-black opacity-0 peer-checked:opacity-100 left-1 pointer-events-none" />
                  </div>
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
          <>
            {/* Certification Badge for High Scores */}
            {auditResult.score >= 75 && (
              <Card className="border-2 border-[#3fe56c] bg-[#1c1b1b] shadow-lg shadow-[#3fe56c]/20">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#3fe56c]/20 flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8 text-[#3fe56c]" />
                  </div>
                  <h2 className="text-2xl font-black text-white">GigShield Certified Fair Employer</h2>
                  <div className="space-y-2">
                    <p className="text-lg text-[#3fe56c] font-bold">{platformName}</p>
                    <p className="text-3xl font-black text-white">{auditResult.score}/100</p>
                    <p className="text-sm text-neutral-300">Verified: {new Date().toLocaleDateString()}</p>
                    <Badge className="bg-[#3fe56c] text-black font-bold">Certified</Badge>
                  </div>
                  <Button 
                    onClick={downloadBadge}
                    className="bg-[#3fe56c] hover:bg-[#37cf61] text-black font-bold"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Badge
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Audit Results */}
            <Card className="border border-neutral-800 bg-[#1c1b1b] shadow-lg">
              <CardHeader className="border-b border-neutral-800 p-6">
                <CardTitle className="text-xl font-bold text-white">Audit Results</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Score Display */}
                <div className="text-center space-y-2">
                  <div className={`text-5xl font-black ${
                    auditResult.score >= 80 ? 'text-[#22c55e]' :
                    auditResult.score >= 50 ? 'text-[#facc15]' : 'text-[#ef4444]'
                  }`}>
                    {auditResult.score}/100
                  </div>
                  <Badge className={
                    auditResult.score >= 80 ? 'bg-[#22c55e] text-white' :
                    auditResult.score >= 50 ? 'bg-[#facc15] text-black' : 'bg-[#ef4444] text-white'
                  }>
                    {auditResult.score >= 80 ? '✓ Compliant' :
                     auditResult.score >= 50 ? '⚠️ Partially Compliant' : '✗ Non-Compliant'}
                  </Badge>
                </div>

                {/* Penalty Exposure for Non-Compliant */}
                {auditResult.score < 50 && auditResult.estimatedPenalty && (
                  <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-red-400 mb-2">Estimated Penalty Exposure</h3>
                    <p className="text-2xl font-bold text-white">₹{auditResult.estimatedPenalty.toLocaleString()}/month</p>
                    <p className="text-sm text-neutral-300 mt-2">
                      For awareness only. Not a legal enforcement.
                    </p>
                  </div>
                )}

                {/* Violations */}
                {auditResult.violations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Violations Found</h3>
                    <div className="space-y-2">
                      {auditResult.violations.map((violation, idx) => {
                        const clause = violation.includes("accident insurance")
                          ? "Telangana Act Sec 12"
                          : violation.includes("grievance")
                          ? "Telangana Act Sec 8"
                          : violation.includes("minimum earnings")
                          ? "Telangana Act Sec 14"
                          : "Telangana Act Sec 20"
                        return (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <span className="text-red-400">✗</span>
                            <div>
                              <p className="text-white font-semibold">{violation}</p>
                              <p className="text-sm text-neutral-300">Violation: {clause}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Recommended Fixes */}
                {auditResult.actionItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Recommended Fixes</h3>
                    <div className="space-y-2">
                      {auditResult.actionItems.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <span className="text-green-400">✓</span>
                          <p className="text-white">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Platform Insight */}
                <div className="border border-neutral-700 bg-neutral-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-2">Real-time Platform Insight</h3>
                  <p className="text-neutral-200">{platformInsight}</p>
                </div>
              </CardContent>
            </Card>
          </>
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
                <p className="text-sm text-neutral-200">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
