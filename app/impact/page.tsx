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
    const doc = new jsPDF();
    const primaryColor = [63, 229, 108]; // #3fe56c
    const secondaryColor = [28, 27, 27]; // #1c1b1b
    const textColor = [20, 20, 20];
    const lightTextColor = [100, 100, 100];

    // --- PAGE 1: COVER PAGE ---
    // Background accent
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 297, "F");
    
    // Header Strip
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, "F");
    
    // Logo / Brand
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("GigShield", 20, 25);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(".", 62, 25);
    
    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(32);
    doc.text("Gig Economy", 20, 80);
    doc.text("Exploitation &", 20, 95);
    doc.text("Impact Report", 20, 110);
    
    // Decorative line
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(2);
    doc.line(20, 120, 60, 120);
    
    // Scope Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 140);
    doc.text(`Scope: Aggregate Worker Reports (N=${totalReports})`, 20, 148);
    doc.text("Territory: India (Regional Data Samples)", 20, 156);
    
    // Footer Credit
    doc.setFontSize(10);
    doc.text("CONFIDENTIAL | FOR POLICY & ADVOCACY USE ONLY", 20, 280);

    // --- PAGE 2: EXECUTIVE SUMMARY ---
    doc.addPage();
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 15, "F");
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("1. Executive Summary", 14, 30);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const summaryText = "This report details systemic wage underpayment and algorithmic exploitation within major gig commerce platforms. Based on verified worker-submitted logs, we have detected consistent deviations from standard fair-pay benchmarks.";
    doc.text(doc.splitTextToSize(summaryText, 180), 14, 40);

    // Key Metrics Box
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 55, 182, 45, "F");
    doc.setDrawColor(220, 220, 220);
    doc.rect(14, 55, 182, 45, "S");
    
    doc.setFontSize(10);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text("TOTAL UNDERPAID WAGES DETECTED", 20, 65);
    doc.text("TOTAL WORKER REPORTS", 110, 65);
    doc.text("CRITICAL INSIGHT", 20, 85);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`INR ${totalDeficit.toLocaleString()}`, 20, 75);
    doc.text(`${totalReports} entries`, 110, 75);
    doc.setFontSize(11);
    doc.text(insights, 20, 93);

    // Platform Audit Table
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("2. Platform Compliance Audit", 14, 120);
    
    let y = 135;
    // Table Header
    doc.setFillColor(0, 0, 0);
    doc.rect(14, y, 182, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("PLATFORM", 18, y + 6);
    doc.text("REPORTS", 60, y + 6);
    doc.text("AVG DEFICIT", 90, y + 6);
    doc.text("COMPLIANCE STATE", 130, y + 6);
    
    y += 10;
    groupByPlatform.forEach((p, i) => {
      doc.setTextColor(0, 0, 0);
      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(14, y, 182, 10, "F");
      }
      doc.text(p.platform, 18, y + 6);
      doc.text(p.workerCount.toString(), 60, y + 6);
      doc.text(`INR ${p.avgDeficit.toFixed(0)}`, 90, y + 6);
      
      if (p.compliance === "Compliant") doc.setTextColor(0, 150, 0);
      else if (p.compliance === "Partially") doc.setTextColor(150, 150, 0);
      else doc.setTextColor(200, 0, 0);
      
      doc.text(p.compliance, 130, y + 6);
      y += 10;
    });

    // --- PAGE 3: ECONOMIC IMPACT ---
    doc.addPage();
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 15, "F");
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("3. Economic Impact Projection", 14, 30);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const econText = `If the hourly minimum wage is standardized at INR ${targetWage}/hr (Telangana Gig Worker Act baseline), the following economic shifts are projected locally:`;
    doc.text(doc.splitTextToSize(econText, 180), 14, 40);

    // Impact Grid
    doc.rect(14, 55, 50, 30, "S");
    doc.text("Monthly Increase / Worker", 18, 65, { maxWidth: 40 });
    doc.setFont("helvetica", "bold");
    doc.text(`INR ${additionalMonthlyIncome.toFixed(0)}`, 18, 78);
    
    doc.setFont("helvetica", "normal");
    doc.rect(74, 55, 50, 30, "S");
    doc.text("Total Annual GDP Gain", 78, 65, { maxWidth: 40 });
    doc.setFont("helvetica", "bold");
    doc.text(`INR ${totalAnnualGainCrore} Cr`, 78, 78);
    
    doc.setFont("helvetica", "normal");
    doc.rect(134, 55, 50, 30, "S");
    doc.text("Estimated Tax Revenue", 138, 65, { maxWidth: 40 });
    doc.setFont("helvetica", "bold");
    doc.text(`INR ${taxGainCrore} Cr`, 138, 78);

    // Policy Recommendations
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("4. Policy Recommendations", 14, 110);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const recommendations = [
      "• Algorithmic Transparency: Implement mandatory audits for payout logic.",
      "• Minimum Earnings Guarantee: Standardize a base rate of INR 93/hr + fuel overhead.",
      "• Social Security Pool: Platforms to contribute 2% of revenue to state-managed insurance.",
      "• Grievance Redressal: Independent verification of worker deactivations and disputes."
    ];
    
    let recY = 120;
    recommendations.forEach(rec => {
      doc.text(doc.splitTextToSize(rec, 170), 20, recY);
      recY += 12;
    });

    doc.save(`GigShield_Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

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
                  <CardTitle className="text-sm text-neutral-300">Total Reports</CardTitle>
                  <p className="text-3xl font-bold text-white">{totalReports}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1c1b1b] border border-neutral-800">
                <CardContent>
                  <CardTitle className="text-sm text-neutral-300">Total Underpaid Wages</CardTitle>
                  <p className="text-3xl font-bold text-white">₹{totalDeficit.toFixed(0)}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1c1b1b] border border-neutral-800">
                <CardContent>
                  <CardTitle className="text-sm text-neutral-300">Most Exploitative</CardTitle>
                  <p className="text-2xl font-bold text-white">{mostExploitative}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1c1b1b] border border-neutral-800">
                <CardContent>
                  <CardTitle className="text-sm text-neutral-300">Cities Covered</CardTitle>
                  <p className="text-2xl font-bold text-white">{new Set(logs.map((item) => (item as any).city)).size || 0}</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-[#1c1b1b] border border-neutral-800 rounded-lg p-4">
              <p className="text-sm text-neutral-200 font-semibold">Key Insight</p>
              <p className="text-white mt-1">{insights}</p>
            </div>

            <Card className="bg-[#1c1b1b] border border-neutral-800">
              <CardHeader className="p-5">
                <CardTitle className="text-xl font-bold text-white">What if minimum wage increases?</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white">Set target wage: ₹{targetWage}</span>
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
                    <p className="text-xs text-neutral-300">Additional monthly income / worker</p>
                    <p className="text-xl font-bold text-white">₹{additionalMonthlyIncome.toFixed(0)}</p>
                  </div>
                  <div className="bg-[#131313] p-3 rounded-lg">
                    <p className="text-xs text-neutral-300">Total annual increase</p>
                    <p className="text-xl font-bold text-white">₹{totalAnnualGainCrore} Cr</p>
                  </div>
                  <div className="bg-[#131313] p-3 rounded-lg">
                    <p className="text-xs text-neutral-300">Estimated tax revenue</p>
                    <p className="text-xl font-bold text-white">₹{taxGainCrore} Cr</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1c1b1b] border border-neutral-800">
              <CardHeader className="p-5">
                <CardTitle className="text-xl font-bold text-white">Platform Compliance Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5 overflow-x-auto">
                <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                  <thead className="text-neutral-400 uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="px-4 py-2">Platform</th>
                      <th className="px-4 py-2">Worker count</th>
                      <th className="px-4 py-2">Avg deficit</th>
                      <th className="px-4 py-2 text-center">Compliance</th>
                      <th className="px-4 py-2 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupByPlatform.map((p) => (
                      <tr key={p.platform} className="bg-neutral-900/30 hover:bg-neutral-900/60 transition-colors group">
                        <td className="px-4 py-4 rounded-l-xl font-bold text-white group-hover:text-[#3fe56c] transition-colors">{p.platform}</td>
                        <td className="px-4 py-4 text-neutral-200">{p.workerCount}</td>
                        <td className="px-4 py-4 font-medium text-neutral-100 italic">₹{p.avgDeficit.toFixed(0)}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            p.compliance === "Compliant" 
                              ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                              : p.compliance === "Partially"
                              ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}>
                            {p.compliance}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right rounded-r-xl font-bold text-neutral-300">
                          {platformTrend[p.platform] === "improving" ? (
                            <span className="text-green-500">↑ improving</span>
                          ) : platformTrend[p.platform] === "worsening" ? (
                            <span className="text-red-500">↓ worsening</span>
                          ) : (
                            <span className="text-neutral-500">→ stable</span>
                          )}
                        </td>
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
