"use client"

import { useState } from "react"
import { CalculationResult } from "@/lib/calculator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2, Languages, Loader2, Share2, ShieldAlert, Calculator } from "lucide-react"
import ExploitationGauge from "@/components/ExploitationGauge"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { getDeviceId } from "@/lib/device"
import { supabase } from "@/lib/supabase"
import VerifyProtectionCTA from "@/components/VerifyProtectionCTA"

const PLATFORMS = ["Swiggy", "Zomato", "Ola", "Uber", "Rapido", "Urban Company"]
const CITIES = ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Secunderabad"]

export default function CheckerPage() {
  const [platform, setPlatform] = useState("")
  const [city, setCity] = useState("")
  const [ordersPerDay, setOrdersPerDay] = useState("")
  const [hoursPerDay, setHoursPerDay] = useState("")
  const [monthlyPay, setMonthlyPay] = useState("")

  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CalculationResult | null>(null)
  
  const [rightsText, setRightsText] = useState("")
  const [isLoadingRights, setIsLoadingRights] = useState(false)

  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)

  useEffect(() => {
    if (result) {
      fetchRights(result)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

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

      // Insert earnings_log after successful calculation
      const fallbackDeviceId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`

      const deviceId = getDeviceId() || fallbackDeviceId
      console.log("DEVICE ID USED:", deviceId)

      const payload = {
        platform: platform || "unknown",
        city: city || "unknown",
        orders_per_day: Number(ordersPerDay) || 0,
        hours_per_day: Number(hoursPerDay) || 0,
        monthly_earnings: Number(monthlyPay) || 0,
        calculated_deficit: Number(data.result.monthlyDeficit) || 0,
        device_id: deviceId,
      }

      console.log("🚀 INSERT PAYLOAD:", payload)
      const { data: insertData, error: insertError } = await supabase
        .from("earnings_logs")
        .insert(payload)
        .select()

      console.log("📦 INSERT RESPONSE:", insertData)
      console.log("❌ INSERT ERROR FULL:", JSON.stringify(insertError, null, 2))
      if (insertError) {
        console.error("❌ FINAL INSERT ERROR:", insertError)
      }

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

  const getShareText = () => {
    if (!result) return ""
    const url = "https://gigshield-six.vercel.app"
    return result.isUnderpaid
      ? `*[GigShield Wage Alert]*\n\nI checked my real earnings for *${platform}* in ${city}.\n\n- Legal Min Wage: *₹${result.fairMinimumPerHour}/hr*\n- My Actual Pay: *₹${result.actualPayPerHour}/hr*\n- Stolen Wages: *₹${result.monthlyDeficit}/month*\n\nThis includes petrol and bike maintenance deduction.\n\nCheck if YOU are being underpaid:\n${url}`
      : `*[GigShield Verified]*\n\nI checked my earnings for *${platform}* in ${city}.\n\n- Legal Min Wage: *₹${result.fairMinimumPerHour}/hr*\n- My Actual Pay: *₹${result.actualPayPerHour}/hr*\n\nMy pay meets the Telangana legal standard!\n\nCheck your own pay:\n${url}`
  }

  const handleShare = () => {
    if (!result) return
    navigator.clipboard.writeText(getShareText())
    toast.success("Result copied to clipboard!")
  }

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!result) return
    const text = getShareText()
    const encoded = encodeURIComponent(text)
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank")
  }

  const handleSubmitReport = async () => {
    if (!result) return
    setIsSubmittingReport(true)
    try {
      const device_id = getDeviceId()
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
          device_id,
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
    <div className="min-h-screen bg-[#0e0e0e] py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#ff7162]/30 text-white font-sans pb-32 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 mb-2">
            <Calculator className="w-4 h-4 text-[#3fe56c]" />
            <span className="text-[10px] font-bold text-neutral-300 tracking-widest uppercase">{t.checkMyPay}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">{t.checkMyPay}</h1>
          <p className="text-neutral-400 font-medium max-w-sm mx-auto">Verify your earnings against the Telangana legal minimum wage (2025).</p>
        </div>
        <VerifyProtectionCTA />

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
                  <label className="text-sm font-bold tracking-wide text-neutral-300 uppercase">{t.platform}</label>
                  <Select value={platform} onValueChange={(val) => setPlatform(val || "")}>
                    <SelectTrigger className="bg-[#131313] border-neutral-800 text-white h-12 rounded-xl focus:ring-[#3fe56c] focus:ring-offset-0 focus:ring-offset-[#1c1b1b]">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c1b1b] border-neutral-800 text-white rounded-xl">
                      <SelectGroup>
                        {PLATFORMS.map(p => (
                          <SelectItem key={p} value={p} className="focus:bg-[#131313]! focus:text-white! cursor-pointer">{p}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2.5">
                  <label className="text-sm font-bold tracking-wide text-neutral-300 uppercase">{t.city}</label>
                  <Select value={city} onValueChange={(val) => setCity(val || "")}>
                    <SelectTrigger className="bg-[#131313] border-neutral-800 text-white h-12 rounded-xl focus:ring-[#3fe56c] focus:ring-offset-0 focus:ring-offset-[#1c1b1b]">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c1b1b] border-neutral-800 text-white rounded-xl">
                      <SelectGroup>
                        {CITIES.map(c => (
                          <SelectItem key={c} value={c} className="focus:bg-[#131313]! focus:text-white! cursor-pointer">{c}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-bold tracking-wide text-neutral-300 uppercase">{t.ordersPerDay}</label>
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
                <label className="text-sm font-bold tracking-wide text-neutral-300 uppercase">{t.hoursPerDay}</label>
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
                <label className="text-sm font-bold tracking-wide text-neutral-300 uppercase">{t.monthlyEarnings}</label>
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

              <Button type="submit" className="w-full h-16 mt-8 rounded-xl bg-gradient-to-br from-[#3fe56c] to-[#00c853] hover:brightness-110 text-[#002108] font-extrabold text-lg transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(0,200,83,0.3)]" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : null}
                {isLoading ? 'Calculating...' : t.checkBtn}
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
                  {result.isUnderpaid ? t.underpaid : t.fairPay}
                </span>
                
                {result.isUnderpaid ? (
                  <>
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#ff7162] tracking-tighter leading-tight drop-shadow-lg">
                      ₹{result.monthlyDeficit.toLocaleString('en-IN')}
                      <span className="block text-2xl md:text-3xl font-extrabold text-[#ff4c4c]/80 mt-2 uppercase tracking-tight">{t.deficit}</span>
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
                  <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2">{t.yourPay}</p>
                  <p className="text-3xl font-black text-white">₹{result.actualPayPerHour}<span className="text-base text-neutral-500">/hr</span></p>
                </div>
                <div className="bg-[#0e0e0e]/50 rounded-2xl p-5 text-center border border-white/5 hover:bg-[#0e0e0e]/80 transition-colors">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2">{t.legalMin}</p>
                  <p className="text-3xl font-black text-white">₹{result.fairMinimumPerHour}<span className="text-base text-neutral-500">/hr</span></p>
                </div>
              </div>
            </div>

            {/* EXPLOITATION GAUGE */}
            {result.isUnderpaid && (
              <div className="flex flex-col items-center py-6">
                <ExploitationGauge percentage={result.deficitPercentage} />
                <p className="text-neutral-400 text-sm font-medium mt-4">Exploitation severity based on wage deficit</p>
              </div>
            )}

            {/* SHARE BUTTONS */}
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleShare} className="h-14 rounded-2xl bg-[#1c1b1b] hover:bg-[#262626] border border-neutral-800 text-white font-bold transition-all active:scale-95 group">
                <Share2 className="mr-2 h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" /> {t.shareResult}
              </Button>
              <Button onClick={handleWhatsAppShare} className="h-14 rounded-2xl bg-[#1a3a1a] hover:bg-[#1f4a1f] border border-[#3ce36a]/30 text-[#3ce36a] font-bold transition-all active:scale-95">
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </Button>
            </div>

            {/* LEGAL RIGHTS & PETITION SECTION */}
            <Card className="bg-[#1c1b1b] border-neutral-800 rounded-[28px] overflow-hidden shadow-2xl">
              <CardHeader className="bg-[#131313] border-b border-neutral-800/50 p-6 md:p-8">
                <CardTitle className="text-xl flex items-center gap-3 text-white font-bold">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <ShieldAlert className="w-5 h-5 text-indigo-400" />
                  </div>
                  {t.knowRights}
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
                  <div className="text-neutral-200 font-medium leading-relaxed max-w-none text-base">
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
                  {reportSubmitted ? "Report Added to Index ✓" : t.submitReport}
                </Button>
              </CardFooter>
            </Card>

          </div>
        )}
      </div>
    </div>
  )
}
