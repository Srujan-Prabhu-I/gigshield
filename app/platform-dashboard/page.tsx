"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2, TrendingUp } from "lucide-react"

interface EarningsLog {
  platform: string
  monthly_earnings: number
  calculated_deficit: number
}

interface PlatformData {
  platform: string
  workers: number
  avgEarnings: number
  avgDeficit: number
  exploitationScore: number
}

function getBadgeVariant(score: number) {
  if (score <= 10) return "default"
  if (score <= 25) return "secondary"
  return "destructive"
}

function getBadgeText(score: number) {
  if (score <= 10) return "Fair"
  if (score <= 25) return "Concerning"
  return "Exploitative"
}

export default function PlatformDashboardPage() {
  const [data, setData] = useState<PlatformData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: logs, error } = await supabase
      .from("earnings_logs")
      .select("platform, monthly_earnings, calculated_deficit")

    if (error) {
      console.error("Error fetching earnings logs:", error)
      setLoading(false)
      return
    }

    // Aggregate by platform
    const grouped = logs.reduce((acc, log) => {
      if (!acc[log.platform]) {
        acc[log.platform] = { count: 0, totalEarnings: 0, totalDeficit: 0 }
      }
      acc[log.platform].count++
      acc[log.platform].totalEarnings += log.monthly_earnings
      acc[log.platform].totalDeficit += log.calculated_deficit
      return acc
    }, {} as Record<string, { count: number; totalEarnings: number; totalDeficit: number }>)

    const platformData: PlatformData[] = Object.entries(grouped).map(
      ([platform, { count, totalEarnings, totalDeficit }]) => {
        const avgEarnings = totalEarnings / count
        const avgDeficit = totalDeficit / count
        const exploitationScore = avgEarnings > 0 ? (avgDeficit / avgEarnings) * 100 : 0
        return {
          platform,
          workers: count,
          avgEarnings,
          avgDeficit,
          exploitationScore,
        }
      }
    )

    setData(platformData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#3fe56c]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] py-8 px-4 sm:px-6 lg:px-8 text-white font-sans pb-32 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 mb-2">
            <TrendingUp className="w-4 h-4 text-[#3fe56c]" />
            <span className="text-[10px] font-bold text-neutral-300 tracking-widest uppercase">Platform Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">Platform Insights</h1>
          <p className="text-neutral-400 font-medium max-w-sm mx-auto">
            Aggregated earnings data across platforms to highlight wage gaps and exploitation trends.
          </p>
        </div>

        {/* PLATFORM CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((platform) => (
            <Card
              key={platform.platform}
              className="bg-[#1c1b1b] border border-neutral-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-[24px] overflow-hidden"
            >
              <CardHeader className="border-b border-neutral-800/50 bg-[#131313]/50 pb-4 pt-6">
                <CardTitle className="text-xl text-white font-bold">{platform.platform}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Workers</span>
                  <span className="font-semibold">{platform.workers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Avg Earnings</span>
                  <span className="font-semibold">₹{platform.avgEarnings.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Avg Deficit</span>
                  <span className="font-semibold">₹{platform.avgDeficit.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Exploitation Score</span>
                  <Badge variant={getBadgeVariant(platform.exploitationScore)}>
                    {getBadgeText(platform.exploitationScore)} ({platform.exploitationScore.toFixed(1)}%)
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CHART */}
        <Card className="bg-[#1c1b1b] border border-neutral-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-[24px] overflow-hidden">
          <CardHeader className="border-b border-neutral-800/50 bg-[#131313]/50 pb-4 pt-6">
            <CardTitle className="text-xl text-white font-bold">Exploitation Comparison</CardTitle>
            <p className="text-neutral-400 text-sm">Average deficit across platforms</p>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="platform" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1b1b",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#FFFFFF" }}
                />
                <Bar dataKey="avgDeficit" fill="#ff7162" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}