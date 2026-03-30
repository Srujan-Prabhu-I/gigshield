"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react"

type PlatformData = {
  platform: string
  avgMonthlyEarnings: number
  avgHourlyEarnings: number
  count: number
}

type ComparisonResult = {
  platform: string
  avgHourlyEarnings: number
  label: "Best Paying" | "Average" | "Low Paying"
  color: string
}

type EarningsLogRow = {
  platform: string | null
  city: string | null
  monthly_earnings: number | null
  orders_per_day: number | null
  hours_per_day: number | null
}

export default function ComparePage() {
  const [platforms, setPlatforms] = useState<PlatformData[]>([])
  const [loading, setLoading] = useState(true)
  const [hoursPerDay, setHoursPerDay] = useState(8)
  const [selectedCity, setSelectedCity] = useState("")
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([])
  const [cities, setCities] = useState<string[]>([])

  useEffect(() => {
    const fetchPlatformData = async () => {
      setLoading(true)
      
      const { data, error } = await supabase
        .from("earnings_logs")
        .select("platform, city, monthly_earnings, orders_per_day, hours_per_day")

      if (error) {
        console.error("Failed to fetch platform data:", error)
        setLoading(false)
        return
      }

      const logs: EarningsLogRow[] = (data || []) as EarningsLogRow[]
      
      // Extract unique cities
      const uniqueCities = Array.from(new Set(logs.map((log) => log.city).filter(Boolean) as string[]))
      setCities(uniqueCities)

      // Group by platform and calculate averages
      const platformStats = logs.reduce<Record<string, { totalEarnings: number; totalHours: number; count: number }>>((acc, log) => {
        const platform = log.platform || "Unknown"
        if (!acc[platform]) {
          acc[platform] = { totalEarnings: 0, totalHours: 0, count: 0 }
        }
        acc[platform].totalEarnings += Number(log.monthly_earnings) || 0
        acc[platform].totalHours += Number(log.hours_per_day) || 0
        acc[platform].count += 1
        return acc
      }, {})

      const platformData: PlatformData[] = Object.entries(platformStats).map(([platform, stats]) => {
        const avgMonthlyEarnings = stats.count > 0 ? stats.totalEarnings / stats.count : 0
        const avgHoursPerDay = stats.count > 0 ? stats.totalHours / stats.count : 8
        const avgHourlyEarnings = avgHoursPerDay > 0 ? (avgMonthlyEarnings / 26) / avgHoursPerDay : 0

        return {
          platform,
          avgMonthlyEarnings,
          avgHourlyEarnings,
          count: stats.count
        }
      }).filter(p => p.count >= 3) // Only include platforms with 3+ reports

      setPlatforms(platformData)
      setLoading(false)
    }

    fetchPlatformData()
  }, [])

  const runComparison = () => {
    if (platforms.length === 0) return

    // Ensure we are comparing based on the user-provided "Hours per day"
    const analyzedPlatforms = platforms.map(p => {
      // Logic: Monthly / (Hours * 26) = Hourly
      // We assume the user-provided hoursPerDay is the standard for comparison
      const hourlyRate = p.avgMonthlyEarnings / (hoursPerDay * 26)
      return {
        ...p,
        avgHourlyEarnings: hourlyRate
      }
    })

    // Sort platforms by hourly earnings
    const sortedPlatforms = [...analyzedPlatforms].sort((a, b) => b.avgHourlyEarnings - a.avgHourlyEarnings)
    
    const results: ComparisonResult[] = sortedPlatforms.map((platform, index) => {
      let label: "Best Paying" | "Average" | "Low Paying"
      let color: string

      // Determine label based on the 93/hr minimum wage from the Telangana Act
      if (platform.avgHourlyEarnings >= 93) {
        label = "Best Paying"
        color = "text-[#3fe56c]"
      } else if (platform.avgHourlyEarnings < 70) {
        label = "Low Paying"
        color = "text-[#ef4444]"
      } else {
        label = "Average"
        color = "text-[#facc15]"
      }

      return {
        platform: platform.platform,
        avgHourlyEarnings: platform.avgHourlyEarnings,
        label,
        color
      }
    })

    setComparisons(results)
  }

  const getIcon = (label: string) => {
    switch (label) {
      case "Best Paying":
        return <TrendingUp className="w-6 h-6 text-[#3fe56c]" />
      case "Low Paying":
        return <TrendingDown className="w-6 h-6 text-[#ef4444]" />
      default:
        return <Minus className="w-6 h-6 text-[#facc15]" />
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Compare Platform Earnings</h1>
          <p className="text-neutral-300 text-lg">Data-backed comparison based on the <span className="text-[#3fe56c] font-bold">₹93/hr</span> Telangana Act minimum.</p>
        </div>

        <Card className="border border-neutral-800 bg-[#1c1b1b] shadow-xl">
          <CardHeader className="border-b border-neutral-800 p-6">
            <CardTitle className="text-xl font-bold text-white">Market Intelligence Filters</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-neutral-400 uppercase tracking-wider">Hours per day</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-[#111] text-white border border-neutral-800 focus:border-[#3fe56c] focus:ring-1 focus:ring-[#3fe56c] transition-all h-12"
                  placeholder="8"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-neutral-400 uppercase tracking-wider">City Statistics</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#111] text-white border border-neutral-800 focus:border-[#3fe56c] focus:ring-1 focus:ring-[#3fe56c] transition-all h-12"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={runComparison}
              disabled={platforms.length === 0}
              className="w-full bg-[#3fe56c] hover:bg-[#37cf61] text-black font-black h-12 rounded-xl transition-all shadow-lg shadow-[#3fe56c]/10"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Generate Comparison Report
            </Button>
          </CardContent>
        </Card>

        {comparisons.length > 0 && (
          <Card className="border border-neutral-800 bg-[#1c1b1b] shadow-2xl">
            <CardHeader className="border-b border-neutral-800 p-6">
              <CardTitle className="text-xl font-bold text-white">Comparative Performance Index</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {comparisons.map((result) => (
                  <Card 
                    key={result.platform}
                    className={`border-2 transition-all duration-300 ${
                      result.label === "Best Paying" 
                        ? 'border-[#3fe56c] bg-[#3fe56c]/5 shadow-lg shadow-[#3fe56c]/10' 
                        : result.label === "Low Paying"
                        ? 'border-[#ef4444]/30 bg-[#ef4444]/5'
                        : 'border-neutral-800 bg-[#151515]'
                    }`}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className={`w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto shadow-inner`}>
                        {getIcon(result.label)}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">{result.platform}</h3>
                        <div className="flex justify-center mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest bg-neutral-900 border border-neutral-800 ${result.color}`}>
                            {result.label}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-3xl font-black text-white">₹{result.avgHourlyEarnings.toFixed(1)}</p>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">per hour</p>
                      </div>
                      <div className="pt-2 border-t border-neutral-800/50">
                        <p className="text-xs text-neutral-400 font-medium">
                          est. <span className="text-white">₹{(result.avgHourlyEarnings * hoursPerDay * 26).toLocaleString()}</span> p.m.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                <p className="text-xs text-neutral-400 text-center leading-relaxed">
                  Insights powered by <span className="text-white font-bold">{platforms.reduce((sum, p) => sum + p.count, 0)} verified reports</span> from active gig workers.<br/>
                  Calculation based on {hoursPerDay} hours/day across 26 days per month.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-neutral-300">Loading platform data...</p>
          </div>
        )}
      </div>
    </div>
  )
}
