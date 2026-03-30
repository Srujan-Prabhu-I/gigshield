"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/supabase-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

type UserRoleRow = { platform_name: string | null; role: string }
type RateRow = {
  platform: string
  city: string
  pay_per_hour_equivalent: number
  compliance_score: number
  has_insurance: boolean
  has_grievance_portal: boolean
  has_min_guarantee: boolean
}
type Submission = { platform: string; monthly_pay: number; deficit: number; created_at: string }
type Grievance = { id: string; platform: string; city: string; issue_type: string; description: string; created_at: string; status?: string }

function statusText(score: number) {
  if (score <= 30) return "Fair"
  if (score <= 60) return "Concerning"
  return "Exploitative"
}

export default function PlatformDashboardPage() {
  const [platformName, setPlatformName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [comparison, setComparison] = useState<RateRow[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>({})
  const [submittingResponse, setSubmittingResponse] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { user, error: userError } = await getCurrentUser()
      if (userError || !user) throw new Error("Not authenticated")

      const { data: roleRow, error: roleError } = await supabase
        .from("user_roles")
        .select("platform_name, role")
        .eq("user_id", user.id)
        .single<UserRoleRow>()
      if (roleError || !roleRow?.platform_name) throw roleError ?? new Error("Missing platform role")
      const name = roleRow.platform_name
      setPlatformName(name)

      const { data: comparisonData, error: comparisonError } = await supabase
        .from("platform_rates")
        .select("platform, city, pay_per_hour_equivalent, compliance_score, has_insurance, has_grievance_portal, has_min_guarantee")
        .eq("city", "Hyderabad")
        .order("pay_per_hour_equivalent", { ascending: false })
      if (comparisonError) throw comparisonError

      const { data: submissionData, error: submissionError } = await supabase
        .from("submissions")
        .select("platform, monthly_pay, deficit, created_at")
        .eq("platform", name)
        .order("created_at", { ascending: false })
      if (submissionError) throw submissionError

      const { data: grievanceData, error: grievanceError } = await supabase
        .from("grievances")
        .select("id, platform, city, issue_type, description, created_at, status")
        .eq("platform", name)
        .order("created_at", { ascending: false })
      if (grievanceError) throw grievanceError

      setComparison((comparisonData ?? []) as RateRow[])
      setSubmissions((submissionData ?? []) as Submission[])
      setGrievances((grievanceData ?? []) as Grievance[])
    } catch (fetchError) {
      console.error("Platform dashboard error:", fetchError)
      setError("Failed to load platform dashboard.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const ranked = useMemo(() => [...comparison], [comparison])
  const ownIndex = useMemo(() => ranked.findIndex((row) => row.platform === platformName), [ranked, platformName])
  const ownRate = ownIndex >= 0 ? ranked[ownIndex] : null
  const aboveRate = ownIndex > 0 ? ranked[ownIndex - 1] : null

  const dailyTrend = useMemo(() => {
    const map: Record<string, number> = {}
    for (const row of submissions) {
      const dateKey = new Date(row.created_at).toISOString().slice(0, 10)
      map[dateKey] = (map[dateKey] ?? 0) + 1
    }
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
  }, [submissions])

  const avgPay = submissions.length ? submissions.reduce((sum, s) => sum + s.monthly_pay, 0) / submissions.length : 0
  const avgDeficit = submissions.length ? submissions.reduce((sum, s) => sum + s.deficit, 0) / submissions.length : 0
  const exploitScore = Math.min(100, Math.round((avgDeficit / 19285) * 100))

  const submitResponse = async (grievance: Grievance) => {
    const text = responseDrafts[grievance.id]?.trim()
    if (!text) {
      toast.error("Enter a response first.")
      return
    }
    setSubmittingResponse(grievance.id)
    try {
      const { error: responseError } = await supabase.from("grievance_responses").insert({
        platform: platformName,
        worker_city: grievance.city,
        issue_type: grievance.issue_type,
        response_text: text,
        status: "acknowledged",
      })
      if (responseError) throw responseError

      const { error: updateError } = await supabase
        .from("grievances")
        .update({ status: "acknowledged" })
        .eq("id", grievance.id)
      if (updateError) throw updateError

      toast.success("Response submitted.")
      await load()
    } catch (submitError) {
      console.error("Submit grievance response failed:", submitError)
      toast.error("Failed to submit response.")
    } finally {
      setSubmittingResponse(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-4 md:p-8 pb-28">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="bg-purple-950/30 border-purple-800">
          <CardContent className="p-6">
            <h1 className="text-2xl md:text-3xl font-black">{platformName || "Platform"} Intelligence Dashboard</h1>
            <p className="text-purple-200 mt-2">Powered by GigShield anonymous worker data</p>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((id) => <Skeleton key={id} className="h-40 bg-neutral-800" />)}
          </div>
        ) : error ? (
          <Card className="bg-red-950/30 border-red-900">
            <CardContent className="p-4">
              <p className="text-red-300">{error}</p>
              <Button onClick={load} variant="outline" className="mt-3 border-red-700 text-red-300">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-[#151515] border-neutral-800">
              <CardHeader><CardTitle>How You Compare to Competitors</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="text-left py-2">Rank</th><th className="text-left py-2">Platform</th><th className="text-left py-2">Pay/hr</th><th className="text-left py-2">Workers</th><th className="text-left py-2">Avg Deficit</th><th className="text-left py-2">Score</th><th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranked.map((row, index) => (
                      <tr key={`${row.platform}-${index}`} className={`border-b border-neutral-900 ${row.platform === platformName ? "bg-purple-900/20" : ""}`}>
                        <td className="py-2">#{index + 1}</td>
                        <td className="py-2">{row.platform}</td>
                        <td className={`py-2 ${row.pay_per_hour_equivalent >= 93 ? "text-green-400" : "text-red-400"}`}>Rs {Math.round(row.pay_per_hour_equivalent)}</td>
                        <td className="py-2">{submissions.length}</td>
                        <td className="py-2">Rs {Math.round(avgDeficit).toLocaleString("en-IN")}</td>
                        <td className="py-2">{row.compliance_score}</td>
                        <td className="py-2"><Badge>{statusText(row.compliance_score)}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-neutral-300 mt-4">You are ranked #{ownIndex + 1} out of {ranked.length} platforms.</p>
                {ownRate && aboveRate ? (
                  <p className="text-neutral-400 text-sm mt-1">
                    Pay Rs {Math.max(0, Math.round(aboveRate.pay_per_hour_equivalent - ownRate.pay_per_hour_equivalent))} more per hour to rank above {aboveRate.platform}.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="bg-[#151515] border-neutral-800">
              <CardHeader><CardTitle>Worker Reports for {platformName}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="bg-[#101010] border-neutral-800"><CardContent className="p-3"><p className="text-xs text-neutral-400">Total Reports</p><p className="text-2xl font-bold">{submissions.length}</p></CardContent></Card>
                  <Card className="bg-[#101010] border-neutral-800"><CardContent className="p-3"><p className="text-xs text-neutral-400">Avg Monthly Pay</p><p className="text-2xl font-bold">Rs {Math.round(avgPay).toLocaleString("en-IN")}</p></CardContent></Card>
                  <Card className="bg-[#101010] border-neutral-800"><CardContent className="p-3"><p className="text-xs text-neutral-400">Avg Deficit</p><p className="text-2xl font-bold text-red-400">-Rs {Math.round(avgDeficit).toLocaleString("en-IN")}</p></CardContent></Card>
                  <Card className="bg-[#101010] border-neutral-800"><CardContent className="p-3"><p className="text-xs text-neutral-400">Exploitation Score</p><p className="text-2xl font-bold">{exploitScore}/100</p></CardContent></Card>
                </div>
                <div className="h-52 bg-[#101010] rounded-xl p-2 border border-neutral-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTrend}>
                      <XAxis dataKey="date" stroke="#a3a3a3" />
                      <YAxis stroke="#a3a3a3" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#151515] border-neutral-800">
              <CardHeader><CardTitle>Worker Complaints</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {grievances.length ? grievances.map((grievance) => (
                  <Card key={grievance.id} className="bg-[#101010] border-neutral-800">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge>{grievance.issue_type}</Badge>
                        <Badge variant="outline">{grievance.city}</Badge>
                        <Badge variant="outline">{grievance.status ?? "pending"}</Badge>
                      </div>
                      <p className="text-sm text-neutral-300">{grievance.description}</p>
                      <textarea
                        value={responseDrafts[grievance.id] ?? ""}
                        onChange={(event) => setResponseDrafts((prev) => ({ ...prev, [grievance.id]: event.target.value }))}
                        placeholder="Write response..."
                        className="w-full min-h-24 rounded-xl border border-neutral-700 bg-[#0c0c0c] p-3 text-sm"
                      />
                      <Button onClick={() => submitResponse(grievance)} disabled={submittingResponse === grievance.id} className="bg-purple-600 hover:bg-purple-500 text-white">
                        {submittingResponse === grievance.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Respond
                      </Button>
                    </CardContent>
                  </Card>
                )) : <p className="text-sm text-neutral-400">No complaints yet.</p>}
              </CardContent>
            </Card>

            {ownRate ? (
              <Card className="bg-[#151515] border-neutral-800">
                <CardHeader><CardTitle>Compliance Score Card</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-4xl font-black">{ownRate.compliance_score}/100</div>
                  <Badge className={ownRate.compliance_score > 75 ? "bg-green-500/20 text-green-300 border-green-700" : ownRate.compliance_score >= 50 ? "bg-amber-500/20 text-amber-300 border-amber-700" : "bg-red-500/20 text-red-300 border-red-700"}>
                    {ownRate.compliance_score > 75 ? "Compliant" : ownRate.compliance_score >= 50 ? "Partial" : "Non-Compliant"}
                  </Badge>
                  {ownRate.compliance_score > 75 ? <p className="text-green-300">GigShield Verified</p> : null}
                  <ul className="text-sm text-neutral-300 list-disc list-inside space-y-1">
                    {!ownRate.has_insurance ? <li>Introduce worker insurance coverage.</li> : null}
                    {!ownRate.has_grievance_portal ? <li>Launch a grievance portal.</li> : null}
                    {!ownRate.has_min_guarantee ? <li>Offer a minimum earnings guarantee.</li> : null}
                  </ul>
                  <Link href="/platform/audit">
                    <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                      Run Full Compliance Audit
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

