"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2, Calendar, TrendingDown, CheckCircle2, ShieldAlert, FileText, Clock, AlertTriangle } from "lucide-react"

type EarningsLog = {
  id: string
  created_at: string
  platform: string
  city: string
  orders_per_day: number
  hours_per_day: number
  monthly_earnings: number
  calculated_deficit: number
}

type Grievance = {
  id: string
  created_at: string
  platform: string
  issue_type: string
  description: string
  status: string
}

export default function WorkerHistoryPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<EarningsLog[]>([])
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'earnings' | 'grievances'>('earnings')

  // Protect route
  useEffect(() => {
    if (!loading && (!user || role !== "worker")) {
      router.push("/")
    }
  }, [user, role, loading, router])

  // Fetch history
  useEffect(() => {
    if (!user?.id) return
    
    const fetchData = async () => {
      setDataLoading(true)
      try {
        const [earningsRes, grievancesRes] = await Promise.all([
          supabase
            .from("earnings_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("grievances")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        ])
        
        if (!earningsRes.error && earningsRes.data) {
          setLogs(earningsRes.data as EarningsLog[])
        }
        if (!grievancesRes.error && grievancesRes.data) {
          setGrievances(grievancesRes.data as Grievance[])
        }
      } catch (err) {
        console.error("Failed to fetch history:", err)
      } finally {
        setDataLoading(false)
      }
    }
    
    fetchData()
  }, [user?.id])

  if (loading || !user || role !== "worker") {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#3fe56c] animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 font-medium">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Activity History
          </h1>
          <p className="text-neutral-400 text-lg">
            Track your past pay checks, deficits, and formal grievance statuses.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-[#1c1b1b] p-1.5 rounded-2xl w-full max-w-sm border border-neutral-800">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'earnings' 
                ? 'bg-[#131212] text-white shadow-sm border border-neutral-800/50' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Calendar className="w-4 h-4" /> Earnings
          </button>
          <button
            onClick={() => setActiveTab('grievances')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'grievances' 
                ? 'bg-[#131212] text-white shadow-sm border border-neutral-800/50' 
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Grievances
            {grievances.length > 0 && (
              <span className="bg-[#ff7162] text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {grievances.length}
              </span>
            )}
          </button>
        </div>

        {dataLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#3fe56c] animate-spin" />
          </div>
        ) : activeTab === 'earnings' ? (
          logs.length === 0 ? (
            <div className="bg-[#131212] border border-neutral-800 rounded-3xl p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-neutral-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Earnings Logs</h3>
              <p className="text-neutral-400 max-w-sm mx-auto">
                You haven't checked your pay yet. Go to the Checker tool to log your first shift.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => {
                const isUnderpaid = log.calculated_deficit > 0;
                const date = new Date(log.created_at).toLocaleDateString("en-US", {
                  year: 'numeric', month: 'short', day: 'numeric'
                });

                return (
                  <div key={log.id} className="bg-[#1c1b1b] border border-neutral-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 md:w-1/3">
                      <p className="text-sm text-neutral-400 font-medium mb-1">{date}</p>
                      <h3 className="text-xl font-bold tracking-tight">{log.platform} <span className="text-neutral-500 text-sm font-normal">({log.city})</span></h3>
                      <p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">
                        {log.hours_per_day} hrs/day • {log.orders_per_day} orders/day
                      </p>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="bg-[#131212] rounded-xl p-4 border border-neutral-800/50">
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Reported Pay</p>
                        <p className="text-xl font-black text-white">₹{log.monthly_earnings.toLocaleString()}<span className="text-xs text-neutral-500 font-normal">/mo</span></p>
                      </div>
                      <div className={`rounded-xl p-4 border ${isUnderpaid ? 'bg-[#2a0808] border-[#ff7162]/30' : 'bg-[#002108] border-[#3fe56c]/30'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isUnderpaid ? 'text-[#ff7162]' : 'text-[#3fe56c]'}`}>
                          {isUnderpaid ? 'Deficit' : 'Status'}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {isUnderpaid ? (
                            <>
                              <p className="text-xl font-black text-[#ff7162]">₹{log.calculated_deficit.toLocaleString()}</p>
                              <TrendingDown className="w-4 h-4 text-[#ff7162]" />
                            </>
                          ) : (
                            <>
                              <p className="text-xl font-black text-[#3fe56c]">Fair Pay</p>
                              <CheckCircle2 className="w-4 h-4 text-[#3fe56c]" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          grievances.length === 0 ? (
            <div className="bg-[#131212] border border-neutral-800 rounded-3xl p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-neutral-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Grievances Filed</h3>
              <p className="text-neutral-400 max-w-sm mx-auto">
                You haven't filed any formal complaints against platforms.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {grievances.map((g) => {
                const date = new Date(g.created_at).toLocaleDateString("en-US", {
                  year: 'numeric', month: 'short', day: 'numeric'
                });
                
                const isPending = g.status === 'pending';
                const isResolved = g.status === 'resolved' || g.status === 'closed';

                return (
                  <div key={g.id} className="bg-[#1c1b1b] border border-neutral-800 rounded-2xl p-6 space-y-4 relative overflow-hidden">
                    {/* Status accent border */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isResolved ? 'bg-green-500' : isPending ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                    
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border ${
                            isResolved 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : isPending 
                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                            {isResolved ? (
                              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {g.status}</span>
                            ) : isPending ? (
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {g.status}</span>
                            ) : (
                              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {g.status}</span>
                            )}
                          </span>
                          <span className="text-xs text-neutral-500">{date}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{g.issue_type}</h3>
                        <p className="text-sm font-medium text-neutral-400">Against <span className="text-white uppercase px-1">{g.platform}</span></p>
                      </div>
                      
                      <button className="bg-[#131313] hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-sm font-medium py-2 px-3 rounded-xl transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Output Letter
                      </button>
                    </div>
                    
                    <div className="bg-[#131212] p-4 rounded-xl border border-neutral-800/50">
                      <p className="text-sm text-neutral-300 leading-relaxed italic border-l-2 border-neutral-800 pl-3">"{g.description}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
