"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, FileText, AlertTriangle, TrendingDown, MoreVertical, Megaphone, BadgeCheck, Loader2, Download, MapPin } from "lucide-react"
import { jsPDF } from "jspdf"
import Link from "next/link"

type PlatformData = {
  platform: string
  avgDeficit: number
  workerCount: number
  exploitationScore: number
}

type CityData = {
  city: string
  count: number
}

export default function AnalyticsDashboard() {
  const [platforms, setPlatforms] = useState<PlatformData[]>([])
  const [cities, setCities] = useState<CityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/exploitation")
        const json = await res.json()
        if (json.index) setPlatforms(json.index)
        if (json.cities) setCities(json.cities)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const exportPDF = () => {
    const doc = new jsPDF()
    const totalSubmissions = platforms.reduce((acc, p) => acc + p.workerCount, 0)
    const totalDeficit = platforms.reduce((acc, p) => acc + (p.avgDeficit * p.workerCount), 0)
    
    // Header
    doc.setFillColor(30, 30, 30)
    doc.rect(0, 0, 210, 40, "F")
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("GigShield Analytics Report", 14, 20)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(200, 200, 200)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)
    
    // Executive Summary
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Executive Summary", 14, 55)
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Total Worker Reports: ${totalSubmissions}`, 14, 65)
    doc.text(`Total Monthly Deficit Discovered: Rs. ${totalDeficit.toLocaleString('en-IN')}`, 14, 73)
    
    if (platforms.length > 0) {
      const worst = [...platforms].sort((a, b) => b.avgDeficit - a.avgDeficit)[0]
      doc.text(`Highest Exploitation Identified: ${worst.platform} (Rs. ${worst.avgDeficit.toLocaleString('en-IN')}/mo avg deficit)`, 14, 81)
    }

    // Platform Index Table
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Platform Exploitation Index", 14, 100)
    
    // Table Header
    doc.setFillColor(240, 240, 240)
    doc.rect(14, 105, 182, 10, "F")
    doc.setFontSize(11)
    doc.text("Platform", 18, 112)
    doc.text("Avg. Monthly Deficit", 80, 112)
    doc.text("Reports", 140, 112)
    doc.text("Severity", 170, 112)
    
    // Table Body
    doc.setFont("helvetica", "normal")
    let yPos = 122
    platforms.forEach((p, i) => {
      // Add a page if we run out of room
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      
      doc.text(p.platform, 18, yPos)
      doc.text(`Rs. ${p.avgDeficit.toLocaleString('en-IN')}`, 80, yPos)
      doc.text(p.workerCount.toString(), 140, yPos)
      
      // Calculate severity text
      const severity = p.exploitationScore > 60 ? "Critical" : p.exploitationScore > 30 ? "High" : "Moderate"
      doc.text(severity, 170, yPos)
      
      // Draw bottom border
      doc.setDrawColor(220, 220, 220)
      doc.line(14, yPos + 3, 196, yPos + 3)
      
      yPos += 10
    })

    // City Hotspots
    yPos += 10
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Geographic Hotspots", 14, yPos)
    
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    yPos += 10
    
    cities.slice(0, 10).forEach(c => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.text(`${c.city}: ${c.count} reports`, 18, yPos)
      yPos += 8
    })
    
    // Footer
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(9)
    doc.text("GigShield Collective Intelligence Platform — Enforcing the Telangana Gig Workers Act", 14, 285)
    
    doc.save("GigShield-Intelligence-Report.pdf")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center pb-24">
        <Loader2 className="w-8 h-8 text-neutral-500 animate-spin" />
      </div>
    )
  }

  const totalSubmissions = platforms.reduce((acc, p) => acc + p.workerCount, 0)
  const sortedPlatforms = [...platforms].sort((a, b) => b.avgDeficit - a.avgDeficit)
  const mostExploitative = sortedPlatforms[0]?.platform || "N/A"
  
  const totalDeficit = platforms.reduce((acc, p) => acc + (p.avgDeficit * p.workerCount), 0)
  const globalAvgDeficit = totalSubmissions > 0 ? Math.round(totalDeficit / totalSubmissions) : 0

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-4 md:p-8 font-sans pb-24 md:pb-8 selection:bg-green-500/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-md md:max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2">System Overview</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
              Analytics Dashboard
            </h1>
          </div>
          <button onClick={exportPDF} className="flex items-center gap-2 text-sm font-bold bg-[#1c1b1b] border border-neutral-800 hover:bg-[#201f1f] transition-colors py-3 px-5 rounded-full text-neutral-300 w-full md:w-auto justify-center">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </header>

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#131313] border border-neutral-800/60 rounded-3xl p-6 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <FileText className="w-5 h-5 text-[#3ce36a]" />
              <div className="bg-[#003912] text-[#3fe56c] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#00c853]/30">+12%</div>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-1">Total Submissions</p>
              <p className="text-2xl font-black text-white">{totalSubmissions.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-[#131313] border border-neutral-800/60 rounded-3xl p-6 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <AlertTriangle className="w-5 h-5 text-[#2fb9f9]" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-1">Top Exploitative</p>
              <p className="text-2xl font-black text-white truncate">{mostExploitative}</p>
            </div>
          </div>
        </div>

        {/* AVERAGE DEFICIT CARD */}
        <div className="bg-gradient-to-br from-[#2a1313] to-[#131313] border border-[#ff4c4c]/20 rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
          <TrendingDown className="absolute right-6 top-6 w-32 h-32 text-[#ff4c4c]/10 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-[#ff4c4c]" />
              <span className="text-xs font-bold tracking-widest text-[#ff4c4c] uppercase">Average Deficit</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-[#ff7162] tracking-tighter mb-2">
              -₹{globalAvgDeficit.toLocaleString('en-IN')}<span className="text-2xl md:text-3xl text-[#ff7162]/60 font-bold">/mo</span>
            </h2>
            <p className="text-sm font-medium text-neutral-400">Monthly gap across all verified platforms</p>
          </div>
        </div>

        {/* UNDERPAYMENT TREND GRID */}
        <div className="bg-[#131313] border border-neutral-800/60 rounded-[32px] p-6 md:p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Underpayment Trend</h3>
              <p className="text-xs font-medium text-neutral-500">Platform comparison (all time)</p>
            </div>
            <MoreVertical className="w-5 h-5 text-neutral-600" />
          </div>

          <div className="space-y-6">
            {sortedPlatforms.map((platform) => {
              // Calculate width based on max deficit
              const maxDeficit = Math.max(...platforms.map(p => p.avgDeficit)) || 1
              const percentage = Math.min(100, Math.max(5, (platform.avgDeficit / maxDeficit) * 100))
              const isPositive = platform.avgDeficit <= 0
              
              return (
                <div key={platform.platform} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-neutral-200">{platform.platform}</span>
                    <span className={isPositive ? "text-[#3ce36a]" : "text-[#ff7162]"}>
                      {isPositive ? '+' : '-'}₹{Math.abs(platform.avgDeficit).toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[#1c1b1b] rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isPositive ? 'bg-[#3ce36a]' : 'bg-[#ff7162]'}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CITY HEATMAP */}
        {cities.length > 0 && (
          <div className="bg-[#131313] border border-neutral-800/60 rounded-[32px] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="w-5 h-5 text-[#2fb9f9]" />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">City Hotspots</h3>
                <p className="text-xs font-medium text-neutral-500">Geographic distribution of exploitation reports</p>
              </div>
            </div>

            <div className="space-y-5">
              {cities.map((city) => {
                const maxCount = Math.max(...cities.map(c => c.count)) || 1
                const percentage = Math.min(100, Math.max(8, (city.count / maxCount) * 100))
                const intensity = city.count / maxCount
                const barColor = intensity > 0.7 ? "#ef4444" : intensity > 0.4 ? "#f59e0b" : "#3ce36a"
                
                return (
                  <div key={city.city} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-neutral-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: barColor }} />
                        {city.city}
                      </span>
                      <span className="text-neutral-400">{city.count} reports</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#1c1b1b] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CRITICAL INSIGHTS */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4 mt-8 px-2">Critical Insights</h3>
          
          <div className="bg-[#131313] border border-[#ff4c4c]/20 rounded-2xl p-5 flex gap-4 items-start relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff4c4c]"></div>
            <div className="w-10 h-10 rounded-full bg-[#ff4c4c]/10 flex justify-center items-center shrink-0 border border-[#ff4c4c]/20">
              <Megaphone className="w-4 h-4 text-[#ff4c4c]" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">New Policy Alert</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">Platforms updated gig algorithms in your region. Expected deficit increase: 8%.</p>
            </div>
          </div>

          <div className="bg-[#131313] border border-[#3ce36a]/20 rounded-2xl p-5 flex gap-4 items-start relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3ce36a]"></div>
            <div className="w-10 h-10 rounded-full bg-[#3ce36a]/10 flex justify-center items-center shrink-0 border border-[#3ce36a]/20">
              <BadgeCheck className="w-4 h-4 text-[#3ce36a]" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Fair Pay Achievement</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">Local Urban Company batches currently meeting ethical standards.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
