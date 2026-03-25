"use client"

import { useState } from "react"
import { CalculationResult } from "@/lib/calculator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2, Languages, Loader2, Share2, ShieldAlert } from "lucide-react"

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
      
      // Auto-fetch rights
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Check Your Pay</h1>
          <p className="text-slate-500">Find out if you are being paid the legal minimum wage in Telangana (2025).</p>
        </div>

        {/* INPUT FORM */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Enter your typical limits below. We do not store your name.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Platform</label>
                  <Select value={platform} onValueChange={(val) => setPlatform(val || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PLATFORMS.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">City</label>
                  <Select value={city} onValueChange={(val) => setCity(val || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {CITIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Orders/trips per day</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="50"
                  value={ordersPerDay}
                  onChange={e => setOrdersPerDay(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                  placeholder="e.g. 15"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Hours worked per day</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="20"
                  value={hoursPerDay}
                  onChange={e => setHoursPerDay(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                  placeholder="e.g. 10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Monthly earnings (₹)</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={monthlyPay}
                  onChange={e => setMonthlyPay(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                  placeholder="e.g. 15000"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="w-4 h-4 text-slate-500" />
                  <label className="text-sm font-medium leading-none">Language Preference</label>
                </div>
                <div className="flex gap-2">
                  {["en" as const, "hi" as const, "te" as const].map((lang) => (
                    <Button
                      key={lang}
                      type="button"
                      variant={language === lang ? "default" : "outline"}
                      onClick={() => setLanguage(lang)}
                      className="flex-1 uppercase"
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading} size="lg">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Check My Pay
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* RESULT CARD */}
        {result && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <Card className={`border-2 ${result.isUnderpaid ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {result.isUnderpaid ? (
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      )}
                      {platform} in {city}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Based on {hoursPerDay} hours/day
                    </CardDescription>
                  </div>
                  <Badge variant={result.isUnderpaid ? "destructive" : "default"} className={!result.isUnderpaid ? "bg-green-600 hover:bg-green-700 hover:text-white" : ""}>
                    {result.isUnderpaid ? "Underpaid" : "Fair Pay"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-2 bg-white/50 rounded-lg p-6">
                  {result.isUnderpaid ? (
                    <>
                      <h3 className="text-4xl font-black text-red-600 tracking-tight">₹{result.monthlyDeficit.toLocaleString('en-IN')}<span className="text-lg font-bold text-red-500/70">/mo</span></h3>
                      <p className="text-red-700 font-medium">You are being underpaid.</p>
                      <p className="text-sm text-red-600/80">That's ₹{result.annualDeficit.toLocaleString('en-IN')} per year deficit.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-4xl font-black text-green-600 tracking-tight">Fair Pay</h3>
                      <p className="text-green-700 font-medium">You are earning above the legal minimum.</p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-center divide-x divide-slate-200">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Pay</p>
                    <p className="text-2xl font-bold text-slate-900">₹{result.actualPayPerHour}/hr</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Legal Min</p>
                    <p className="text-2xl font-bold text-slate-900">₹{result.fairMinimumPerHour}/hr</p>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button onClick={handleShare} variant="outline" className="flex-1 bg-white">
                    <Share2 className="mr-2 h-4 w-4" /> Share Result
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  Know Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingRights ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                ) : (
                  <div className="prose prose-sm prose-slate max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-slate-700 font-medium">
                      {rightsText || "Rights information unavailable."}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-slate-50 border-t border-slate-100 flex flex-col gap-3 py-4">
                <p className="text-sm text-center text-slate-500 w-full">
                  Help the government enforce minimum wage laws. Submit this data anonymously.
                </p>
                <Button 
                  onClick={handleSubmitReport} 
                  disabled={isSubmittingReport || reportSubmitted} 
                  className="w-full"
                  variant={reportSubmitted ? "secondary" : "default"}
                >
                  {isSubmittingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {reportSubmitted ? "Report submitted. Thank you." : "Submit Anonymous Report"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
