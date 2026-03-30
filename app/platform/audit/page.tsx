"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ShieldAlert, Sparkles, Download, Award, Loader2 } from "lucide-react"
import { toast } from "sonner"

type AuditResult = {
  score: number
  status: "Compliant" | "Partially Compliant" | "Non-Compliant"
  violations: string[]
  actionItems: string[]
  verified: boolean
  estimatedPenalty?: number
}

type EarningsLogRow = {
  platform: string | null
  city: string | null
  monthly_earnings: number | null
  calculated_deficit: number | null
}

export default function PlatformPortalPage() {
  const router = useRouter()
  const { user, role, loading: authLoading } = useAuth()
  const [platformName, setPlatformName] = useState("")
  const [avgPayPerDelivery, setAvgPayPerDelivery] = useState(0)
  const [accidentInsurance, setAccidentInsurance] = useState(false)
  const [grievancePortal, setGrievancePortal] = useState(false)
  const [minEarningsGuarantee, setMinEarningsGuarantee] = useState(false)
  const [weeklyHours, setWeeklyHours] = useState(0)
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [earningsLogs, setEarningsLogs] = useState<EarningsLogRow[]>([])
  const [avgDeficitByPlatform, setAvgDeficitByPlatform] = useState<Record<string, number>>({})
  const [platformInsight, setPlatformInsight] = useState("")
  const [loadingLogs, setLoadingLogs] = useState(true)

  const canSubmit = platformName.trim().length > 0 && weeklyHours > 0

  // 1. Fetch initial platform profile and audit data
  useEffect(() => {
    async function init() {
      if (!user) return
      
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("platform_name")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()
        
      if (roleRow?.platform_name) {
        const name = roleRow.platform_name
        setPlatformName(name)
        
        // Fetch existing profile/audit
        const { data: profile } = await supabase
          .from("platform_profiles")
          .select("*")
          .eq("platform_name", name)
          .single()
          
        if (profile) {
          setAccidentInsurance(profile.has_insurance)
          setGrievancePortal(profile.has_grievance_portal)
          setMinEarningsGuarantee(profile.has_min_guarantee)
          
          if (profile.audit_data) {
            const data = profile.audit_data as any
            setAvgPayPerDelivery(data.avgPay || 0)
            setWeeklyHours(data.weeklyHours || 0)
            setAuditResult({
              score: profile.compliance_score,
              status: data.status,
              violations: data.violations || [],
              actionItems: data.actionItems || [],
              verified: profile.compliance_score >= 75
            })
          }
        }
      }
    }
    
    if (user && role === "platform") {
      init()
    }
  }, [user, role])

  // 2. Fetch anonymous aggregate logs for insights
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true)
    try {
      const { data, error } = await supabase
        .from("earnings_logs")
        .select("platform, city, monthly_earnings, calculated_deficit")

      if (error) throw error

      const logs = (data || []) as EarningsLogRow[]
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
        Object.entries(stats).map(([plat, s]) => [
          plat, 
          s.count ? (s.totalDeficit / (s.totalEarnings || 1)) * 100 : 0
        ])
      ) as Record<string, number>

      setAvgDeficitByPlatform(avg)
    } catch (err) {
      console.error("Failed to fetch earnings logs", err)
    } finally {
      setLoadingLogs(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // 3. Generate dynamic insights
  useEffect(() => {
    if (!auditResult || !platformName) return

    const platformDeficit = avgDeficitByPlatform[platformName] ?? null
    const insightText = platformDeficit !== null
      ? `Based on anonymous reports, your platform shows a ${platformDeficit.toFixed(1)}% comparative wage deficit.`
      : "No comparative data available yet for your platform."

    setPlatformInsight(insightText)
  }, [auditResult, platformName, avgDeficitByPlatform])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/platform-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: platformName,
          avgPay: Number(avgPayPerDelivery),
          hasInsurance: accidentInsurance,
          hasGrievance: grievancePortal,
          hasMinGuarantee: minEarningsGuarantee,
          weeklyHours: Number(weeklyHours),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed platform audit")

      setAuditResult(data)
      toast.success("Audit complete! Results persisted to your profile.")
      router.refresh()
    } catch (error: any) {
      console.error("Platform audit failed:", error)
      toast.error(error.message || "Failed to run audit")
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
      ctx.fillStyle = '#1c1b1b'
      ctx.fillRect(0, 0, 400, 200)
      ctx.strokeStyle = '#3fe56c'
      ctx.lineWidth = 3
      ctx.strokeRect(5, 5, 390, 190)
      ctx.fillStyle = '#3fe56c'
      ctx.font = '30px Arial'
      ctx.fillText('🛡️', 20, 40)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 18px Arial'
      ctx.fillText('GigShield Certified Fair Employer', 70, 35)
      ctx.fillStyle = '#3fe56c'
      ctx.font = 'bold 24px Arial'
      ctx.fillText(platformName, 20, 80)
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px Arial'
      ctx.fillText(`Score: ${auditResult?.score}/100`, 20, 110)
      ctx.fillStyle = '#888'
      ctx.font = '14px Arial'
      ctx.fillText(`Verified: ${new Date().toLocaleDateString()}`, 20, 140)
      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('✓ CERTIFIED', 20, 170)
      const link = document.createElement('a')
      link.download = `${platformName}-gigshield-certification.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  if (authLoading) return <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center"><Loader2 className="animate-spin text-[#3fe56c]" /></div>

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white py-8 px-4 sm:px-6 lg:px-10 pb-28">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl md:text-5xl font-black">Platform Compliance Portal</h1>
          <p className="text-neutral-300 text-lg">Verify your platform&apos;s compliance with Telangana Gig Workers Act 2025</p>
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
                    readOnly
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] text-neutral-500 border border-neutral-800 h-12 cursor-not-allowed"
                    placeholder="Swiggy"
                  />
                </label>
                <label className="space-y-1 text-sm text-neutral-300">
                  Avg pay per delivery/km
                  <input
                    type="number"
                    step="0.01"
                    value={avgPayPerDelivery || ""}
                    onChange={(e) => setAvgPayPerDelivery(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#111] text-white border border-neutral-700 focus:ring-2 focus:ring-[#3fe56c] h-12"
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
                  className="w-full px-3 py-2 rounded-lg bg-[#111] text-white border border-neutral-700 focus:ring-2 focus:ring-[#3fe56c] h-12"
                  placeholder="40"
                  required
                />
              </label>

              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full mt-2 py-3 h-12 bg-[#3fe56c] text-black font-semibold hover:bg-[#37cf61] transition"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Run Full Audit"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {auditResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {auditResult.score >= 75 && (
              <Card className="border-2 border-[#3fe56c] bg-[#1c1b1b] shadow-lg shadow-[#3fe56c]/20">
                <CardContent className="p-8 text-center space-y-4">
                  <Award className="w-12 h-12 text-[#3fe56c] mx-auto" />
                  <h2 className="text-2xl font-black text-white">GigShield Certified Fair Employer</h2>
                  <div className="space-y-1">
                    <p className="text-lg text-[#3fe56c] font-bold">{platformName}</p>
                    <p className="text-3xl font-black text-white">{auditResult.score}/100</p>
                  </div>
                  <Button onClick={downloadBadge} className="bg-[#3fe56c] hover:bg-[#37cf61] text-black font-bold">
                    <Download className="w-4 h-4 mr-2" /> Download Badge
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="border border-neutral-800 bg-[#1c1b1b]">
              <CardHeader className="border-b border-neutral-800"><CardTitle>Detailed Audit Results</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className={`text-6xl font-black mb-2 ${auditResult.score >= 75 ? 'text-[#3fe56c]' : auditResult.score >= 50 ? 'text-yellow-400' : 'text-red-500'}`}>
                    {auditResult.score}/100
                  </div>
                  <Badge className={auditResult.score >= 75 ? 'bg-[#3fe56c] text-black' : 'bg-neutral-800'}>{auditResult.status}</Badge>
                </div>

                {auditResult.violations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">Major Violations</h3>
                    {auditResult.violations.map((v, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-sm font-medium">{v}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-2">Comparative Insights</h3>
                  <p className="text-sm text-neutral-200">{platformInsight}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
