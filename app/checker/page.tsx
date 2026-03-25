"use client"

import { useState } from "react"
import { CalculationResult } from "@/lib/calculator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2, Languages, Loader2, Share2, ShieldAlert, Calculator } from "lucide-react"

const PLATFORMS = ["Swiggy", "Zomato", "Ola", "Uber", "Rapido", "Urban Company"]
const CITIES = ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Secunderabad"]

export default function CheckerPage() {
  const [platform, setPlatform] = useState("")
  const [city, setCity] = useState("")
  const [ordersPerDay, setOrdersPerDay] = useState("")
  const [hoursPerDay, setHoursPerDay] = useState("")
  const [monthlyPay, setMonthlyPay] = useState("")
  const [language, setLanguage] = useState("en")

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CalculationResult | null>(null)
  
  const [rightsText, setRightsText] = useState("")
  const [isLoadingRights, setIsLoadingRights] = useState(false)

  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!platform || !city || !ordersPerDay || !hoursPerDay || !monthlyPay) {
      toast.error("Please fill in all fields.")
      return
    }

    if (Number(ordersPerDay) <= 0 || Number(hoursPerDay) <= 0 || Number(monthlyPay) <= 0) {
      toast.error("Values must be greater than zero.")
      return
    }

    if (Number(hoursPerDay) > 24) {
      toast.error("Hours per day cannot exceed 24.")
      return
    }

    setIsLoading(true)
    setResult(null)
    setRightsText("")
    
    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          city,
          ordersPerDay: Number(ordersPerDay),
          hoursPerDay: Number(hoursPerDay),
          monthlyPay: Number(monthlyPay),
        })
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || "Failed to calculate")
      
      setResult(data.result)
      
      fetchRights(data.result)

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRights = async (calculation: CalculationResult) => {
    setIsLoadingRights(true)
    try {
      const res = await fetch("/api/rights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          platform,
          monthlyDeficit: calculation.monthlyDeficit,
          isUnderpaid: calculation.isUnderpaid,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch rights")
      
      setRightsText(data.rights)
    } catch (error: any) {
      toast.error("Failed to load your rights context.")
    } finally {
      setIsLoadingRights(false)
    }
  }

  const handleShare = () => {
    if (!result) return
    const text = result.isUnderpaid 
      ? `🚨 Gig Worker Alert: I checked my pay for ${platform} in ${city}. The legal minimum wage in Telangana is ₹${result.fairMinimumPerHour}/hr, but I am making ₹${result.actualPayPerHour}/hr. I am being underpaid by ₹${result.monthlyDeficit}/month. Check your pay at GigShield!`
      : `✅ Good News: I checked my pay for ${platform} in ${city}. I am making ₹${result.actualPayPerHour}/hr which meets the Telangana legal minimum of ₹${result.fairMinimumPerHour}/hr. Check your pay at GigShield!`
    
    navigator.clipboard.writeText(text)
    toast.success("Result copied to clipboard!")
  }

  const handleSubmitReport = async () => {
    if (!result) return
    setIsSubmittingReport(true)
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          city,
          orders_day: Number(ordersPerDay),
          hours_day: Number(hoursPerDay),
          monthly_pay: Number(monthlyPay),
          actualPayPerHour: result.actualPayPerHour,
          monthlyDeficit: result.monthlyDeficit,
          fairMinimumPerHour: result.fairMinimumPerHour,
        })
      })
      
      if (!res.ok) throw new Error("Failed to submit report")
      
      setReportSubmitted(true)
      toast.success("Report submitted. Thank you.")
    } catch (error: any) {
      toast.error("Failed to submit report")
    } finally {
      setIsSubmittingReport(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#ff7162]/30 text-white font-sans pb-32">
      <div className="max-w-xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 mb-2">
            <Calculator className="w-4 h-4 text-[#3fe56c]" />
            <span className="text-[10px] font-bold text-neutral-300 tracking-widest uppercase">Fair Pay Checker</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">Check Your Pay</h1>
          <p className="text-neutral-400 font-medium max-w-sm mx-auto">Verify your earnings against the Telangana legal minimum wage (2025).</p>
        </div>

        {/* INPUT FORM */}
        <Card className="bg-[#1c1b1b] border border-neutral-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-[24px] overflow-hidden">
          <CardHeader className="border-b border-neutral-800/50 bg-[#131313]/50 pb-6 pt-8">
            <CardTitle className="text-2xl text-white font-bold">Job Details</CardTitle>
            <CardDescription className="text-neutral-400 font-medium">Enter your typical limits below. We do not store your name.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <label className="text-sm font-bold tracking-wide text-neutral-300 uppercase">Platform</label>
                  <Select value={platform} onValueChange={(val) => setPlatform(val || "")}>
                    <SelectTrigger className="bg-[#131313] border-neutral-800 text-white h-12 rounded-xl focus:ring-[#3fe56c] focus:ring-offset-0 focus:ring-offset-[#1c1b1b]">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c1b1b] border-neutral-800 text-white rounded-xl">
                      <SelectGroup>
                        {PLATFORMS.map(p => (
                          <SelectItem key={p} value={p} className="focus:bg-[#131313] focus:text-white cursor-pointer">{p}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2.5">
                  <label className="text-sm font-bold tracking-wide text-neutral-300 uppercase">City</label>
                  <Select value={city} onValueChange={(val) => setCity(val || "")}>
                    <SelectTrigger className="bg-[#131313] border-neutral-800 text-white h-12 rounded-xl focus:ring-[#3fe56c] focus:ring-offset-0 focus:ring-offset-[#1c1b1b]">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c1b1b] border-neutral-800 text-white rounded-xl">
                      <SelectGroup>
                        {CITIES.map(c => (
                          <SelectItem key={c} value={c} className="focus:bg-[#131313] focus:text-white cursor-pointer">{c}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-bold tracking-wide text-neutral-300 uppercase">Orders/trips per day</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="50"
                  value={ordersPerDay}
                  onChange={e => setOrdersPerDay(e.target.value)}
                  className="flex h-14 w-full rounded-xl border border-neutral-800 bg-[#131313] px-4 py-2 text-base text-white focus:outline-none focus:border-[#3fe56c] focus:ring-1 focus:ring-[#3fe56c] transition-all"
                  placeholder="e.g. 15"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-bold tracking-wide text-neutral-300 uppercase">Hours worked per day</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="20"
                  value={hoursPerDay}
                  onChange={e => setHoursPerDay(e.target.value)}
                  className="flex h-14 w-full rounded-xl border border-neutral-800 bg-[#131313] px-4 py-2 text-base text-white focus:outline-none focus:border-[#3fe56c] focus:ring-1 focus:ring-[#3fe56c] transition-all"
                  placeholder="e.g. 10"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-bold tracking-wide text-neutral-300 uppercase">Monthly earnings (₹)</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={monthlyPay}
                  onChange={e => setMonthlyPay(e.target.value)}
                  className="flex h-14 w-full rounded-xl border border-neutral-800 bg-[#131313] px-4 py-2 text-base text-white focus:outline-none focus:border-[#3fe56c] focus:ring-1 focus:ring-[#3fe56c] transition-all"
                  placeholder="e.g. 15000"
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="w-4 h-4 text-neutral-500" />
                  <label className="text-sm font-bold tracking-wide text-neutral-400 uppercase">Language Preference</label>
                </div>
                <div className="flex gap-3">
                  {["en" as const, "hi" as const, "te" as const].map((lang) => (
                    <Button
                      key={lang}
                      type="button"
                      variant="outline"
                      onClick={() => setLanguage(lang)}
                      className={`flex-1 h-12 rounded-xl transition-all font-extrabold tracking-widest uppercase ${
                        language === lang 
                        ? "bg-[#3ce36a]/10 border-[#3ce36a]/50 text-[#3ce36a]" 
                        : "bg-[#131313] border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:bg-[#201f1f]"
                      }`}
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full h-16 mt-8 rounded-xl bg-gradient-to-br from-[#3fe56c] to-[#00c853] hover:brightness-110 text-[#002108] font-extrabold text-lg transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(0,200,83,0.3)]" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : null}
                {isLoading ? 'Calculating...' : 'Run Analysis'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="py-5 justify-center bg-[#131313]/30 border-t border-neutral-800/50">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 opacity-80">
              <ShieldAlert className="w-3.5 h-3.5" />
              Your data is anonymous. We do not store personal details.
            </p>
          </CardFooter>
        </Card>

        {/* HIGH-IMPACT RESULT SECTION */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-8 pb-10">
            
            {/* GIANT STATS CARD */}
            <div className={`relative overflow-hidden rounded-[32px] p-8 md:p-12 border ${
              result.isUnderpaid 
                ? "bg-gradient-to-br from-[#2a1313] to-[#1c1b1b] border-[#ff4c4c]/30 shadow-[0_0_50px_rgba(255,76,76,0.15)]" 
                : "bg-gradient-to-br from-[#0c2a15] to-[#1c1b1b] border-[#3ce36a]/30 shadow-[0_0_50px_rgba(60,227,106,0.15)]"
            }`}>
              
              <div className="absolute top-0 left-0 w-full h-1 opacity-50 bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: result.isUnderpaid ? '#ff7162' : '#3ce36a' }}></div>

              <div className="text-center relative z-10 space-y-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase mb-4 ${
                  result.isUnderpaid ? "bg-[#ff4c4c]/10 text-[#ff7162] border border-[#ff4c4c]/20" : "bg-[#3ce36a]/10 text-[#3ce36a] border border-[#3ce36a]/20"
                }`}>
                  {result.isUnderpaid ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {result.isUnderpaid ? "Exploitation Detected" : "Fair Wage Compliant"}
                </span>
                
                {result.isUnderpaid ? (
                  <>
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#ff7162] tracking-tighter leading-tight drop-shadow-lg">
                      ₹{result.monthlyDeficit.toLocaleString('en-IN')}
                      <span className="block text-2xl md:text-3xl font-extrabold text-[#ff4c4c]/80 mt-2 uppercase tracking-tight">Underpaid / Month</span>
                    </h2>
                    <div className="pt-6">
                      <p className="text-[#ffb3ae] font-medium text-lg leading-relaxed max-w-sm mx-auto">
                        You are earning below the Telangana legal minimum wage.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-5xl md:text-6xl font-black text-[#3ce36a] tracking-tighter leading-tight drop-shadow-lg">
                      Fair Pay
                      <span className="block text-2xl md:text-3xl font-extrabold text-[#3ce36a]/80 mt-2 uppercase tracking-tight">Target Met</span>
                    </h2>
                    <div className="pt-6">
                      <p className="text-[#bbcbb8] font-medium text-lg leading-relaxed max-w-sm mx-auto">
                        You are earning above the Telangana legal minimum wage.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-white/5 relative z-10">
                <div className="bg-[#0e0e0e]/50 rounded-2xl p-5 text-center border border-white/5 hover:bg-[#0e0e0e]/80 transition-colors">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2">Your Pay</p>
                  <p className="text-3xl font-black text-white">₹{result.actualPayPerHour}<span className="text-base text-neutral-500">/hr</span></p>
                </div>
                <div className="bg-[#0e0e0e]/50 rounded-2xl p-5 text-center border border-white/5 hover:bg-[#0e0e0e]/80 transition-colors">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2">Legal Min</p>
                  <p className="text-3xl font-black text-white">₹{result.fairMinimumPerHour}<span className="text-base text-neutral-500">/hr</span></p>
                </div>
              </div>
            </div>

            <Button onClick={handleShare} className="w-full h-14 rounded-2xl bg-[#1c1b1b] hover:bg-[#262626] border border-neutral-800 text-white font-bold transition-all active:scale-95 group">
              <Share2 className="mr-2 h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" /> Share Analysis
            </Button>

            {/* LEGAL RIGHTS & PETITION SECTION */}
            <Card className="bg-[#1c1b1b] border-neutral-800 rounded-[28px] overflow-hidden shadow-2xl">
              <CardHeader className="bg-[#131313] border-b border-neutral-800/50 p-6 md:p-8">
                <CardTitle className="text-xl flex items-center gap-3 text-white font-bold">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <ShieldAlert className="w-5 h-5 text-indigo-400" />
                  </div>
                  Know Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                {isLoadingRights ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full bg-neutral-800 rounded-md" />
                    <Skeleton className="h-4 w-5/6 bg-neutral-800 rounded-md" />
                    <Skeleton className="h-4 w-4/6 bg-neutral-800 rounded-md" />
                  </div>
                ) : (
                  <div className="prose prose-invert prose-p:text-neutral-300 prose-p:font-medium prose-p:leading-relaxed max-w-none">
                    <p className="whitespace-pre-wrap">
                      {rightsText || "Rights information unavailable."}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-[#131313] border-t border-neutral-800/50 flex flex-col gap-4 p-6 md:p-8">
                <p className="text-sm text-center text-neutral-400 font-medium">
                  Help the government enforce minimum wage laws. Submit this data anonymously to the GigShield Collective Index.
                </p>
                <Button 
                  onClick={handleSubmitReport} 
                  disabled={isSubmittingReport || reportSubmitted} 
                  className={`w-full h-14 rounded-2xl font-bold transition-all active:scale-[0.98] ${
                    reportSubmitted 
                    ? "bg-[#0e0e0e] border border-neutral-800 text-neutral-500 cursor-not-allowed" 
                    : "bg-white hover:bg-neutral-200 text-black shadow-lg shadow-white/10"
                  }`}
                >
                  {isSubmittingReport ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {reportSubmitted ? "Report Added to Index ✓" : "Submit Anonymous Report"}
                </Button>
              </CardFooter>
            </Card>

          </div>
        )}
      </div>
    </div>
  )
}
