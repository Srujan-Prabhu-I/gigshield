"use client"

import { useCallback, useEffect, useState } from "react"
import { TrendingUp, Users, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"

type TrendData = {
  date: string
  workers: number
  complaints: number
  avgDeficit: number
}

export default function PlatformTrends() {
  const { user } = useAuth()
  const [platformName, setPlatformName] = useState("")
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTrends = useCallback(async (name: string) => {
    setLoading(true)
    try {
      // 1. Fetch Earnings Logs for this platform
      const { data: logs } = await supabase
        .from("earnings_logs")
        .select("created_at, calculated_deficit")
        .eq("platform", name)
        .order("created_at", { ascending: true })

      // 2. Fetch Grievances for this platform
      const { data: complaints } = await supabase
        .from("grievances")
        .select("created_at")
        .eq("platform", name)

      // 3. Process into daily buckets
      const dailyBuckets: Record<string, TrendData> = {}
      
      // Default buckets for last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        dailyBuckets[dateStr] = { date: dateStr, workers: 0, complaints: 0, avgDeficit: 0 }
      }

      // Fill from logs
      logs?.forEach(log => {
        const dateStr = new Date(log.created_at).toISOString().split('T')[0]
        if (dailyBuckets[dateStr]) {
          dailyBuckets[dateStr].workers += 1
          dailyBuckets[dateStr].avgDeficit += Number(log.calculated_deficit) || 0
        }
      })

      // Average the deficit
      Object.values(dailyBuckets).forEach(bucket => {
        if (bucket.workers > 0) {
          bucket.avgDeficit = bucket.avgDeficit / bucket.workers
        }
      })

      // Fill from complaints
      complaints?.forEach(c => {
        const dateStr = new Date(c.created_at).toISOString().split('T')[0]
        if (dailyBuckets[dateStr]) {
          dailyBuckets[dateStr].complaints += 1
        }
      })

      setData(Object.values(dailyBuckets).sort((a, b) => a.date.localeCompare(b.date)))
    } catch (err) {
      console.error("Error fetching trend data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    async function getPlatform() {
      if (!user) return
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("platform_name")
        .eq("user_id", user.id)
        .single()
      
      if (roleRow?.platform_name) {
        setPlatformName(roleRow.platform_name)
        fetchTrends(roleRow.platform_name)
      }
    }
    getPlatform()
  }, [user, fetchTrends])

  if (loading) return <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center"><Loader2 className="animate-spin text-[#3fe56c]" /></div>

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 pb-28 animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#22c55e]/10 p-2 rounded-lg border border-[#22c55e]/20">
                <TrendingUp className="w-5 h-5 text-[#3fe56c]" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                Worker Trends & Analytics
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl pl-12">
              Deep dive into worker supply, sentiment, and complaint patterns for <span className="text-[#3fe56c] font-black uppercase">{platformName}</span>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#1c1b1b] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-500">Active Supply</CardTitle>
              <Users className="w-4 h-4 text-[#3fe56c]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{data.reduce((acc, curr) => acc + curr.workers, 0)}</div>
              <p className="text-[10px] text-neutral-500 mt-1 uppercase">Total reports this week</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1c1b1b] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-500">Avg Deficit</CardTitle>
              <TrendingUp className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">₹{Math.round(data.reduce((acc, curr) => acc + curr.avgDeficit, 0) / (data.filter(d => d.workers > 0).length || 1))}</div>
              <p className="text-[10px] text-neutral-500 mt-1 uppercase">Industry Benchmark Gap</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1c1b1b] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-500">Complaint Vol</CardTitle>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{data.reduce((acc, curr) => acc + curr.complaints, 0)}</div>
              <p className="text-[10px] text-neutral-500 mt-1 uppercase">Legal exposure points</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#111] border-neutral-800 p-6">
            <CardTitle className="text-lg font-black uppercase mb-6 px-2">Workforce Supply (Reports)</CardTitle>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorWorkers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3fe56c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3fe56c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="date" stroke="#525252" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis stroke="#525252" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1b1b', border: '1px solid #404040', borderRadius: '8px' }}
                    itemStyle={{ color: '#3fe56c', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="workers" stroke="#3fe56c" strokeWidth={3} fillOpacity={1} fill="url(#colorWorkers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-[#111] border-neutral-800 p-6">
            <CardTitle className="text-lg font-black uppercase mb-6 px-2">Complaint Volume</CardTitle>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="date" stroke="#525252" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis stroke="#525252" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1b1b', border: '1px solid #404040', borderRadius: '8px' }}
                    itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="complaints" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="bg-[#111] border-neutral-800 p-6">
          <CardTitle className="text-lg font-black uppercase mb-6 px-2">Average Wage Deficit (Reported by Workers)</CardTitle>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#525252" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#525252" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1b1b', border: '1px solid #404040', borderRadius: '8px' }}
                  itemStyle={{ color: '#facc15', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="avgDeficit" stroke="#facc15" strokeWidth={3} dot={{ fill: '#facc15' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
