"use client"

import { useEffect, useState } from "react"
import { Building2, Search, Download, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, IndianRupee } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function GovtComplianceIndex() {
  const { user, role, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [platforms, setPlatforms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!authLoading && (!user || (role !== "govt" && role !== "government"))) {
      router.push("/")
    }
  }, [user, role, authLoading, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 1. Fetch Platform Profiles
      const { data: profiles, error: profileError } = await supabase
        .from('platform_profiles')
        .select('*')
        .order('compliance_score', { ascending: true })
      
      if (profileError) throw profileError

      // 2. Fetch Worker Counts from Roles
      const { data: roleCounts } = await supabase
        .from('user_roles')
        .select('platform_name')
        .eq('role', 'worker')

      const countsMap: Record<string, number> = {}
      roleCounts?.forEach(r => {
        if (r.platform_name) {
          countsMap[r.platform_name] = (countsMap[r.platform_name] || 0) + 1
        }
      })

      // 3. Map to UI Model
      const mapped = (profiles || []).map((p, idx) => {
        let status = "Compliant"
        if (p.compliance_score < 40) status = "Critical"
        else if (p.compliance_score < 60) status = "Warning"
        else if (p.compliance_score < 80) status = "Monitoring"

        return {
          id: `P-${(idx + 1).toString().padStart(2, '0')}`,
          name: p.platform_name,
          sector: p.platform_name.toLowerCase().includes('uber') || p.platform_name.toLowerCase().includes('rapido') ? "Ride Hailing" : 
                  p.platform_name.toLowerCase().includes('urban') ? "Home Services" : 
                  p.platform_name.toLowerCase().includes('zepto') || p.platform_name.toLowerCase().includes('blinkit') ? "Quick Commerce" : "Food Delivery",
          workers: countsMap[p.platform_name] || 0,
          avgWaitTime: "48h SLA",
          basePay: 120, // Default estimate
          complianceScore: p.compliance_score || 0,
          status
        }
      })

      setPlatforms(mapped)
    } catch (err) {
      console.error("Data load failed:", err)
      toast.error("Failed to load compliance data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && (role === "govt" || role === "government")) {
      fetchData()
    }
  }, [user, role])

  const issueNotice = (name: string) => {
    toast.error(`Compliance notice issued to ${name} HQ. Violation record updated.`, {
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />
    })
  }

  const filtered = platforms.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sector.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalLiability = platforms.reduce((acc, p) => acc + (p.complianceScore < 70 ? p.workers * 1000 : 0), 0)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#f9a826] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#2d2100]/30 p-2 rounded-lg border border-[#f9a826]/20">
                <Building2 className="w-5 h-5 text-[#f9a826]" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
                Compliance Index
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl pl-12 italic">
              Monitoring platform compliance across the National Capital Region.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
             <div className="bg-[#111] border border-neutral-800 px-5 py-2.5 rounded-2xl flex items-center gap-4">
                <div className="text-left">
                   <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Est. Penalties</p>
                   <p className="text-xl font-black text-white">₹{totalLiability.toLocaleString()}</p>
                </div>
                <IndianRupee className="w-6 h-6 text-[#ff7162] opacity-50" />
             </div>
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Find Platform..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#1c1b1b] border border-neutral-800 text-sm rounded-lg pl-9 pr-4 py-2.5 w-full focus:outline-none focus:border-[#f9a826] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#131212] border border-neutral-800 rounded-3xl overflow-hidden overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1c1b1b] text-neutral-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Platform Name</th>
                <th className="px-8 py-5">Verified Workers</th>
                <th className="px-8 py-5">Target Score</th>
                <th className="px-8 py-5">Compliance</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filtered.length > 0 ? filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#1a1919] transition-colors group">
                  <td className="px-8 py-6">
                    {p.status === 'Critical' ? (
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#68000b]/50 border border-[#ff7162]/30 shadow-[0_0_15px_rgba(255,113,98,0.1)]">
                        <AlertTriangle className="w-5 h-5 text-[#ff7162]" />
                      </span>
                    ) : p.status === 'Warning' ? (
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#2d2100]/50 border border-[#f9a826]/30 shadow-[0_0_15px_rgba(249,168,38,0.1)]">
                        <AlertTriangle className="w-5 h-5 text-[#f9a826]" />
                      </span>
                    ) : p.status === 'Monitoring' ? (
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#00344b]/50 border border-[#2fb9f9]/30">
                        <Search className="w-5 h-5 text-[#2fb9f9]" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#002108]/50 border border-[#3fe56c]/30">
                        <CheckCircle2 className="w-5 h-5 text-[#3fe56c]" />
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-black text-white uppercase text-lg tracking-tight group-hover:text-[#f9a826] transition-colors">{p.name}</div>
                    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">{p.sector} • ID: {p.id}</div>
                  </td>
                  <td className="px-8 py-6">
                     <p className="text-xl font-black text-white">{p.workers.toLocaleString()}</p>
                     <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Active Accounts</p>
                  </td>
                  <td className="px-8 py-6 text-neutral-300 font-bold">
                    <p className="text-white font-black text-lg">75 <span className="text-neutral-600 text-xs font-medium">MIN</span></p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-black ${
                        p.status === 'Critical' ? 'text-[#ff7162]' : 
                        p.status === 'Warning' ? 'text-[#f9a826]' : 
                        p.status === 'Monitoring' ? 'text-[#2fb9f9]' : 'text-[#3fe56c]'
                      }`}>
                        {p.complianceScore}
                      </span>
                      <div className="w-20 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${
                            p.status === 'Critical' ? 'bg-[#ff7162]' : 
                            p.status === 'Warning' ? 'bg-[#f9a826]' : 
                            p.status === 'Monitoring' ? 'bg-[#2fb9f9]' : 'bg-[#3fe56c]'
                          }`}
                          style={{ width: `${p.complianceScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {p.status === 'Critical' ? (
                      <button 
                        onClick={() => issueNotice(p.name)}
                        className="text-[10px] font-black tracking-widest text-black uppercase bg-[#ff7162] hover:bg-[#ff5a4d] px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,113,98,0.2)] active:scale-95"
                      >
                        Issue Notice
                      </button>
                    ) : p.status === 'Warning' ? (
                      <button 
                        onClick={() => issueNotice(p.name)}
                        className="text-[10px] font-black tracking-widest text-[#f9a826] uppercase bg-[#201c13] hover:bg-[#2d2719] border border-[#f9a826]/30 px-5 py-2.5 rounded-xl transition-all active:scale-95"
                      >
                        Enforce Audit
                      </button>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5 opacity-50 grayscale">
                         <ShieldCheck className="w-4 h-4 text-[#3fe56c]" />
                         <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Compliant</span>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-neutral-500">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-bold">No platform compliance records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
