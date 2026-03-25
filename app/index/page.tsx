"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowRight, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"
import autoAnimate from "@formkit/auto-animate"

type PlatformStats = {
  platform: string
  avgDeficit: number
  workerCount: number
  exploitationScore: number
}

const PLACEHOLDER_PLATFORMS = ["Swiggy", "Zomato", "Ola", "Uber", "Rapido", "Urban Company"]

export default function ExploitationIndex() {
  const [data, setData] = useState<PlatformStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      autoAnimate(listRef.current)
    }
  }, [listRef])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/exploitation")
      const json = await res.json()
      if (json.success && json.index) {
        setData(json.index)
        const total = json.index.reduce((acc: number, item: PlatformStats) => acc + item.workerCount, 0)
        setTotalSubmissions(total)
      }
    } catch (error) {
      toast.error("Failed to fetch leaderboard data")
    } finally {
      if (loading) setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel("public:submissions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "submissions" }, (payload) => {
        toast.success("New report submitted — leaderboard updated")
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getScoreColor = (score: number) => {
    if (score <= 30) return "bg-green-500"
    if (score <= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  const getScoreBadge = (score: number) => {
    if (score <= 30) return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Fair</Badge>
    if (score <= 60) return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-none"><AlertCircle className="w-3 h-3 mr-1" /> Concerning</Badge>
    return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none"><AlertTriangle className="w-3 h-3 mr-1" /> Highly Exploitative</Badge>
  }

  return (
    <div className="min-h-screen bg-black text-neutral-50 px-4 py-8 md:py-16 selection:bg-red-500/30">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* TOP SECTION */}
        <header className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 mb-6 hover:bg-red-500/20 hover:scale-105 transition-all cursor-default shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-red-500 text-[10px] font-bold tracking-widest uppercase">Live Updates</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4">
            Exploitation <span className="text-red-500">Index</span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto font-medium">
            Live rankings based on anonymous worker reports. Updated in real-time.
          </p>

          <div className="pt-2">
            <span className="block text-sm font-semibold text-neutral-500 uppercase tracking-wider">
              Based on {loading ? <Skeleton className="w-8 h-4 inline-block align-middle ml-1" /> : <span className="text-neutral-300">{totalSubmissions}</span>} worker reports
            </span>
          </div>
        </header>

        {/* MAIN LEADERBOARD */}
        <main>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-neutral-900 border-neutral-800 shadow-none">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-8 h-8 rounded-md bg-neutral-800" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32 bg-neutral-800" />
                        <Skeleton className="h-2 w-full bg-neutral-800" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div ref={listRef} className="space-y-4">
              {data.length > 0 ? (
                data.map((item, index) => {
                  const rank = index + 1
                  const isRank1 = rank === 1
                  
                  return (
                    <Card 
                      key={item.platform} 
                      className={`
                        transition-all duration-300 transform
                        ${isRank1 
                          ? "bg-neutral-900 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)] scale-[1.03] z-10 relative my-6" 
                          : "bg-neutral-900/50 border-neutral-800 shadow-none hover:bg-neutral-900 hover:-translate-y-1 hover:shadow-2xl"}
                      `}
                    >
                      <CardContent className={`p-5 md:p-6 ${isRank1 ? 'py-8' : ''}`}>
                        <div className="flex items-start md:items-center gap-4 md:gap-6">
                          {/* Rank Badge */}
                          <div className={`
                            flex items-center justify-center font-black rounded-lg shrink-0
                            ${isRank1 ? "w-12 h-12 text-2xl bg-red-500 text-white shadow-lg shadow-red-500/25" : "w-10 h-10 text-xl bg-neutral-800 text-neutral-400"}
                          `}>
                            #{rank}
                          </div>

                          <div className="flex-1 min-w-0 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                              <h2 className={`font-bold truncate ${isRank1 ? 'text-2xl text-white' : 'text-xl text-neutral-200'}`}>
                                {item.platform}
                              </h2>
                              <div className="shrink-0">
                                {getScoreBadge(item.exploitationScore)}
                              </div>
                            </div>
                            
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-400 font-medium">Exploitation Score</span>
                                <span className={`font-bold ${isRank1 ? 'text-red-400' : 'text-neutral-300'}`}>{item.exploitationScore}/100</span>
                              </div>
                              <Progress 
                                value={item.exploitationScore} 
                                className="h-3 bg-neutral-800 rounded-full"
                                indicatorClassName={`${getScoreColor(item.exploitationScore)} transition-all duration-[1500ms] ease-out`}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                              <div className="bg-black/50 rounded p-3 border border-neutral-800/50">
                                <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Average Deficit</p>
                                <p className="text-sm font-semibold text-neutral-200">
                                  Workers underpaid by <span className={isRank1 ? 'text-red-400' : 'text-amber-400'}>₹{item.avgDeficit.toLocaleString('en-IN')}/month</span>
                                </p>
                              </div>
                              <div className="bg-black/50 rounded p-3 border border-neutral-800/50">
                                <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Data Points</p>
                                <p className="text-sm font-semibold text-neutral-300">
                                  Based on <span className="text-white">{item.workerCount}</span> reports
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                PLACEHOLDER_PLATFORMS.map((platform, index) => (
                  <Card key={platform} className="bg-neutral-900/50 border-neutral-800 shadow-none opacity-60">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 flex items-center justify-center font-bold text-lg bg-neutral-800 text-neutral-500 rounded-lg shrink-0">
                          #{index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-neutral-400">{platform}</h2>
                            <Badge variant="outline" className="border-neutral-700 text-neutral-500">No reports yet</Badge>
                          </div>
                          <Progress value={0} className="h-2 bg-neutral-800" />
                          <p className="text-xs text-neutral-500">Awaiting worker data...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>

        {/* BOTTOM SECTION */}
        <footer className="pt-8 border-t border-neutral-800/50 text-center space-y-6">
          <Link href="/checker" className="inline-block w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-neutral-200 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-xl shadow-white/5 active:scale-95">
              Are you a gig worker? Check your pay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            All data is 100% anonymous. We do not store personal information, riding history, or identifying details. This index is maintained collectively by the gig worker community.
          </p>
        </footer>

      </div>
    </div>
  )
}
