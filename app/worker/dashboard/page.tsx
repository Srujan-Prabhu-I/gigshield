"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

type PlatformRate = {
  platform: string
  city: string
  pay_per_hour_equivalent: number
  has_insurance: boolean
  has_grievance_portal: boolean
  has_min_guarantee: boolean
  compliance_score: number
}

type SubmissionRow = {
  platform: string
  city: string
  deficit: number
  created_at: string
}

const CITIES = ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Secunderabad"]
const LEGAL_MIN = 93

function scoreBadge(score: number) {
  if (score <= 30) return { label: "Fair", color: "bg-green-500/15 text-green-400 border-green-700" }
  if (score <= 60) return { label: "Concerning", color: "bg-amber-500/15 text-amber-400 border-amber-700" }
  return { label: "Highly Exploitative", color: "bg-red-500/15 text-red-400 border-red-700" }
}

function scoreProgressClass(score: number) {
  if (score <= 30) return "bg-green-500"
  if (score <= 60) return "bg-amber-500"
  return "bg-red-500"
}

function timeAgo(isoTime: string) {
  const ms = Date.now() - new Date(isoTime).getTime()
  const hours = Math.floor(ms / (1000 * 60 * 60))
  if (hours < 1) return "just now"
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

export default function WorkerDashboardPage() {
  const [selectedCity, setSelectedCity] = useState("Hyderabad")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [rates, setRates] = useState<PlatformRate[]>([])
  const [news, setNews] = useState<SubmissionRow[]>([])
  const [reportCountByPlatform, setReportCountByPlatform] = useState<Record<string, number>>({})

  const loadData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data: ratesData, error: ratesError } = await supabase
        .from("platform_rates")
        .select("platform, city, pay_per_hour_equivalent, has_insurance, has_grievance_portal, has_min_guarantee, compliance_score")
        .eq("city", selectedCity)
        .order("pay_per_hour_equivalent", { ascending: false })

      if (ratesError) throw ratesError

      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select("platform, city, deficit, created_at")
        .eq("city", selectedCity)
        .order("created_at", { ascending: false })
        .limit(150)

      if (submissionsError) throw submissionsError

      const platformCount: Record<string, number> = {}
      for (const row of submissionsData ?? []) {
        platformCount[row.platform] = (platformCount[row.platform] ?? 0) + 1
      }

      setRates((ratesData ?? []) as PlatformRate[])
      setNews((submissionsData ?? []).slice(0, 5) as SubmissionRow[])
      setReportCountByPlatform(platformCount)
    } catch (fetchError) {
      console.error("Worker dashboard fetch failed:", fetchError)
      setError("Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }, [selectedCity])

  useEffect(() => {
    loadData()
  }, [loadData])

  const topExploitative = useMemo(() => {
    if (!rates.length) return null
    return [...rates].sort((a, b) => b.compliance_score - a.compliance_score)[0]
  }, [rates])

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-4 md:p-8 pb-28">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="bg-[#151515] border-neutral-800">
          <CardContent className="p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Welcome back, Worker</h1>
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-green-400 font-bold uppercase tracking-wide">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </div>
            </div>
            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              className="h-11 rounded-xl border border-neutral-700 bg-black/30 px-3 text-sm"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card className="bg-[#151515] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-xl">Find Your Best Platform</CardTitle>
            <p className="text-sm text-neutral-400">Compare platforms before you work</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((key) => (
                  <Skeleton key={key} className="h-44 w-full bg-neutral-800" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-900 bg-red-950/30 p-4">
                <p className="text-red-300">{error}</p>
                <Button onClick={loadData} variant="outline" className="mt-3 border-red-700 text-red-200">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : (
              rates.map((rate, index) => {
                const badge = scoreBadge(rate.compliance_score)
                const reportCount = reportCountByPlatform[rate.platform] ?? 0
                return (
                  <Card key={`${rate.platform}-${rate.city}`} className="bg-[#101010] border-neutral-800">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold capitalize">{rate.platform}</h3>
                        <Badge className="bg-[#1f1f1f] text-neutral-200 border-neutral-700">#{index + 1}</Badge>
                      </div>

                      <div>
                        <p className={`font-black text-xl ${rate.pay_per_hour_equivalent >= LEGAL_MIN ? "text-green-400" : "text-red-400"}`}>
                          Rs {Math.round(rate.pay_per_hour_equivalent)}/hr
                        </p>
                        <p className={`text-sm ${rate.pay_per_hour_equivalent >= LEGAL_MIN ? "text-green-400" : "text-red-400"}`}>
                          {rate.pay_per_hour_equivalent >= LEGAL_MIN ? "Above Legal Minimum" : "Below Legal Minimum"}
                        </p>
                        <p className="text-xs text-neutral-500">Legal minimum: Rs 93/hr</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge className={rate.has_insurance ? "bg-green-500/15 text-green-300 border-green-700" : "bg-red-500/15 text-red-300 border-red-700"}>
                          {rate.has_insurance ? "Insured" : "No Insurance"}
                        </Badge>
                        <Badge className={rate.has_grievance_portal ? "bg-green-500/15 text-green-300 border-green-700" : "bg-red-500/15 text-red-300 border-red-700"}>
                          {rate.has_grievance_portal ? "Has Portal" : "No Portal"}
                        </Badge>
                        <Badge className={rate.has_min_guarantee ? "bg-green-500/15 text-green-300 border-green-700" : "bg-red-500/15 text-red-300 border-red-700"}>
                          {rate.has_min_guarantee ? "Guaranteed" : "No Guarantee"}
                        </Badge>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-neutral-300">Exploitation Score: {rate.compliance_score}/100</p>
                          <Badge className={badge.color}>{badge.label}</Badge>
                        </div>
                        <Progress value={rate.compliance_score} className="h-2 bg-neutral-800" indicatorClassName={scoreProgressClass(rate.compliance_score)} />
                      </div>

                      <p className="text-xs text-neutral-400">Based on {reportCount} anonymous reports</p>
                      <Link href={`/checker?platform=${encodeURIComponent(rate.platform)}`}>
                        <Button className="w-full bg-[#3fe56c] hover:bg-[#35d15d] text-black font-extrabold">
                          Check My Pay on {rate.platform}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </CardContent>
        </Card>

        {!loading && topExploitative ? (
          <Card className="border-red-900 bg-red-950/25">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="text-red-400 w-5 h-5 mt-0.5" />
              <p className="text-red-200 text-sm">
                ALERT: {topExploitative.platform} is currently the most exploitative platform in {selectedCity}. Exploitation score: {topExploitative.compliance_score}/100
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/worker/checker"><Button className="w-full h-12 bg-[#1a3f27] border border-green-800 hover:bg-[#204d31]">Check My Pay</Button></Link>
          <Link href="/worker/grievance"><Button className="w-full h-12 bg-[#3a1d1d] border border-red-800 hover:bg-[#472323]">File Complaint</Button></Link>
          <Link href="/worker/rights"><Button className="w-full h-12 bg-[#1f233d] border border-indigo-800 hover:bg-[#272c49]">Know My Rights</Button></Link>
        </div>

        <Card className="bg-[#151515] border-neutral-800">
          <CardHeader>
            <CardTitle>Recent Exploitation News</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [1, 2, 3, 4, 5].map((key) => <Skeleton key={key} className="h-10 w-full bg-neutral-800" />)
            ) : news.length ? (
              news.map((item, idx) => (
                <p key={`${item.created_at}-${idx}`} className="text-sm text-neutral-300 border-b border-neutral-800 pb-2">
                  A {item.platform} worker in {item.city} reported Rs {Math.round(item.deficit).toLocaleString("en-IN")} deficit {timeAgo(item.created_at)}
                </p>
              ))
            ) : (
              <p className="text-sm text-neutral-400">No submissions found for this city yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

