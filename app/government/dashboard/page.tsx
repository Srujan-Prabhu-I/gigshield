"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type SubmissionRow = { platform: string; city: string; deficit: number; created_at: string }
type GrievanceRow = { id: string; platform: string; city: string; issue_type: string; description: string; created_at: string; status?: string }
type PlatformRate = { platform: string; pay_per_hour_equivalent: number; compliance_score: number }

function downloadCsv(rows: GrievanceRow[]) {
  const header = ["ID", "Platform", "City", "Issue Type", "Description", "Filed", "Status"]
  const body = rows.map((row) => [row.id, row.platform, row.city, row.issue_type, row.description, row.created_at, row.status ?? "pending"])
  const csv = [header, ...body].map((line) => line.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "gigshield-complaints.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function GovernmentDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [grievances, setGrievances] = useState<GrievanceRow[]>([])
  const [platformRates, setPlatformRates] = useState<PlatformRate[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterPlatform, setFilterPlatform] = useState("all")
  const [filterCity, setFilterCity] = useState("all")
  const [filterIssue, setFilterIssue] = useState("all")
  const [policyWage, setPolicyWage] = useState(93)
  const [warningTarget, setWarningTarget] = useState<string | null>(null)
  const [warningText, setWarningText] = useState("")
  const [loadingWarning, setLoadingWarning] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select("platform, city, deficit, created_at")
      if (submissionsError) throw submissionsError

      const { data: grievancesData, error: grievancesError } = await supabase
        .from("grievances")
        .select("id, platform, city, issue_type, description, created_at, status")
        .order("created_at", { ascending: false })
      if (grievancesError) throw grievancesError

      const { data: ratesData, error: ratesError } = await supabase
        .from("platform_rates")
        .select("platform, pay_per_hour_equivalent, compliance_score")
      if (ratesError) throw ratesError

      setSubmissions((submissionsData ?? []) as SubmissionRow[])
      setGrievances((grievancesData ?? []) as GrievanceRow[])
      setPlatformRates((ratesData ?? []) as PlatformRate[])
    } catch (fetchError) {
      console.error("Government dashboard load failed:", fetchError)
      setError("Failed to load command center data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filteredGrievances = useMemo(
    () =>
      grievances.filter((row) => {
        const platformOk = filterPlatform === "all" || row.platform === filterPlatform
        const cityOk = filterCity === "all" || row.city === filterCity
        const issueOk = filterIssue === "all" || row.issue_type === filterIssue
        return platformOk && cityOk && issueOk
      }),
    [grievances, filterPlatform, filterCity, filterIssue]
  )

  const totalWageTheft = submissions.reduce((sum, row) => sum + row.deficit, 0)
  const citiesCovered = new Set(submissions.map((row) => row.city)).size
  const platformScoreMap: Record<string, number[]> = {}
  for (const row of submissions) {
    platformScoreMap[row.platform] = [...(platformScoreMap[row.platform] ?? []), row.deficit]
  }
  const worstPlatform = Object.entries(platformScoreMap)
    .map(([platform, deficits]) => ({ platform, score: Math.min(100, Math.round((deficits.reduce((a, b) => a + b, 0) / deficits.length / 19285) * 100)) }))
    .sort((a, b) => b.score - a.score)[0]

  const additionalMonthly = Math.max(0, (policyWage - 93) * 26 * 10)
  const annualIncreaseCr = (additionalMonthly * 12 * 1200000) / 10000000
  const taxGainCr = annualIncreaseCr * 0.18
  const spendingBoostCr = annualIncreaseCr * 0.65

  const markReviewed = async (id: string) => {
    try {
      const { error: updateError } = await supabase.from("grievances").update({ status: "reviewed" }).eq("id", id)
      if (updateError) throw updateError
      toast.success("Complaint marked reviewed.")
      await load()
    } catch (updateErr) {
      console.error("Mark reviewed failed:", updateErr)
      toast.error("Failed to mark reviewed.")
    }
  }

  const issueWarning = async (platform: string) => {
    setWarningTarget(platform)
    setLoadingWarning(true)
    try {
      const response = await fetch("/api/rights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "en",
          platform,
          monthlyDeficit: 0,
          isUnderpaid: true,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Warning generation failed")
      setWarningText(`Official Warning Notice for ${platform}\n\n${payload.rights}`)
    } catch (warningError) {
      console.error("Issue warning failed:", warningError)
      toast.error("Unable to generate warning letter.")
      setWarningText(`Official warning draft for ${platform} citing Telangana Gig and Platform Workers Act 2025.`)
    } finally {
      setLoadingWarning(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-4 md:p-8 pb-28">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-amber-950/30 border-amber-800">
          <CardContent className="p-6">
            <h1 className="text-2xl md:text-3xl font-black">GigShield Intelligence Command</h1>
            <p className="text-amber-200 mt-1">Telangana Labour Department | Restricted Access</p>
            <p className="text-sm text-amber-300 mt-2">{new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}</p>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map((key) => <Skeleton key={key} className="h-36 bg-neutral-800" />)}</div>
        ) : error ? (
          <Card className="bg-red-950/30 border-red-900">
            <CardContent className="p-4">
              <p className="text-red-300">{error}</p>
              <Button onClick={load} variant="outline" className="mt-3 border-red-700 text-red-200"><RefreshCw className="mr-2 w-4 h-4" />Retry</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-[#151515] border-neutral-800"><CardContent className="p-4"><p className="text-xs text-neutral-400">Total Reports</p><p className="text-3xl font-black">{submissions.length}</p></CardContent></Card>
              <Card className="bg-[#151515] border-neutral-800"><CardContent className="p-4"><p className="text-xs text-neutral-400">Total Wage Theft</p><p className="text-3xl font-black text-red-400">Rs {(totalWageTheft / 10000000).toFixed(2)} Cr</p></CardContent></Card>
              <Card className="bg-[#151515] border-neutral-800"><CardContent className="p-4"><p className="text-xs text-neutral-400">Most Exploitative</p><p className="text-xl font-black">{worstPlatform?.platform ?? "-"}</p></CardContent></Card>
              <Card className="bg-[#151515] border-neutral-800"><CardContent className="p-4"><p className="text-xs text-neutral-400">Cities Covered</p><p className="text-3xl font-black">{citiesCovered}</p></CardContent></Card>
            </div>

            <Card className="bg-[#151515] border-neutral-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Worker Complaints Filed</CardTitle>
                <Button variant="outline" className="border-neutral-700" onClick={() => downloadCsv(filteredGrievances)}><Download className="w-4 h-4 mr-2" />Download All as CSV</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="h-10 rounded-lg bg-[#101010] border border-neutral-700 px-3"><option value="all">All Platforms</option>{Array.from(new Set(grievances.map((g) => g.platform))).map((p) => <option key={p} value={p}>{p}</option>)}</select>
                  <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="h-10 rounded-lg bg-[#101010] border border-neutral-700 px-3"><option value="all">All Cities</option>{Array.from(new Set(grievances.map((g) => g.city))).map((p) => <option key={p} value={p}>{p}</option>)}</select>
                  <select value={filterIssue} onChange={(e) => setFilterIssue(e.target.value)} className="h-10 rounded-lg bg-[#101010] border border-neutral-700 px-3"><option value="all">All Issue Types</option>{Array.from(new Set(grievances.map((g) => g.issue_type))).map((p) => <option key={p} value={p}>{p}</option>)}</select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-neutral-800 text-neutral-400"><tr><th className="text-left py-2">ID</th><th className="text-left py-2">Platform</th><th className="text-left py-2">City</th><th className="text-left py-2">Issue Type</th><th className="text-left py-2">Filed</th><th className="text-left py-2">Status</th><th className="text-left py-2">Actions</th></tr></thead>
                    <tbody>
                      {filteredGrievances.map((row) => (
                        <>
                          <tr key={row.id} className="border-b border-neutral-900">
                            <td className="py-2">{row.id.slice(0, 8)}</td><td>{row.platform}</td><td>{row.city}</td><td>{row.issue_type}</td><td>{new Date(row.created_at).toLocaleDateString()}</td><td><Badge>{row.status ?? "pending"}</Badge></td>
                            <td className="py-2 flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}>View Details</Button>
                              <Button size="sm" onClick={() => markReviewed(row.id)} className="bg-amber-600 hover:bg-amber-500">Mark Reviewed</Button>
                              <Button size="sm" variant="outline" onClick={() => window.print()}>Download PDF</Button>
                            </td>
                          </tr>
                          {expandedId === row.id ? (
                            <tr key={`${row.id}-details`} className="border-b border-neutral-900"><td colSpan={7} className="py-2 text-neutral-300">{row.description}</td></tr>
                          ) : null}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#151515] border-neutral-800">
              <CardHeader><CardTitle>Platform Compliance Rankings</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {platformRates.map((row) => (
                  <div key={row.platform} className={`rounded-xl p-3 border ${row.compliance_score > 75 ? "border-green-800 bg-green-950/20" : row.compliance_score >= 50 ? "border-amber-800 bg-amber-950/20" : "border-red-800 bg-red-950/20"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold">{row.platform}</p>
                        <p className="text-xs text-neutral-400">Pay/hr: Rs {Math.round(row.pay_per_hour_equivalent)} | Compliance: {row.compliance_score}</p>
                      </div>
                      <Button onClick={() => issueWarning(row.platform)} className="bg-amber-600 hover:bg-amber-500">Issue Warning</Button>
                    </div>
                  </div>
                ))}
                {warningTarget ? (
                  <Card className="bg-[#101010] border-neutral-700 mt-4">
                    <CardHeader><CardTitle className="text-base">Warning Draft - {warningTarget}</CardTitle></CardHeader>
                    <CardContent>
                      {loadingWarning ? <p className="text-neutral-400">Generating warning...</p> : <pre className="whitespace-pre-wrap text-sm text-neutral-300">{warningText}</pre>}
                    </CardContent>
                  </Card>
                ) : null}
              </CardContent>
            </Card>

            <Card className="bg-[#151515] border-neutral-800">
              <CardHeader><CardTitle>Minimum Wage Policy Simulator</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <input type="range" min={93} max={150} value={policyWage} onChange={(e) => setPolicyWage(Number(e.target.value))} className="w-full" />
                <p className="text-sm text-neutral-300">Selected minimum wage: Rs {policyWage}/hr</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p>Additional monthly income per worker: Rs {Math.round(additionalMonthly).toLocaleString("en-IN")}</p>
                  <p>Total annual income increase: Rs {annualIncreaseCr.toFixed(2)} Cr</p>
                  <p>Estimated tax revenue gain: Rs {taxGainCr.toFixed(2)} Cr</p>
                  <p>Consumer spending boost: Rs {spendingBoostCr.toFixed(2)} Cr</p>
                </div>
                <Button variant="outline" className="border-amber-700">Download Policy Brief</Button>
              </CardContent>
            </Card>

            <Button className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white font-black">Download Full Intelligence Report</Button>
          </>
        )}
      </div>
    </div>
  )
}

