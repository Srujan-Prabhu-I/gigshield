"use client"

import { useEffect, useState } from "react"
import { ScrollText, Search, Download, FileWarning, ExternalLink, Loader2, CheckCircle, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function GovtComplaintsPage() {
  const { user, role, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [grievances, setGrievances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!authLoading && (!user || (role !== "govt" && role !== "government"))) {
      router.push("/")
    }
  }, [user, role, authLoading, router])

  const fetchGrievances = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setGrievances(data || [])
    } catch (err) {
      console.error("Failed to fetch grievances:", err)
      toast.error("Failed to load complaints")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && (role === "govt" || role === "government")) {
      fetchGrievances()
    }
  }, [user, role])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('grievances')
        .update({ status: newStatus })
        .eq('id', id)
      
      if (error) throw error
      
      toast.success(`Case status updated to ${newStatus}`)
      setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g))
    } catch (err) {
      console.error("Update failed:", err)
      toast.error("Failed to update status")
    }
  }

  const filtered = grievances.filter(g => 
    g.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.issue_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.id.includes(searchTerm)
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff7162] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#68000b]/30 p-2 rounded-lg border border-[#ff7162]/20">
                <ScrollText className="w-5 h-5 text-[#ff7162]" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                Grievance Command
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl pl-12">
              Review and adjudicate formal complaints filed under the Telangana Gig Act.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search Cases..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#1c1b1b] border border-neutral-800 text-sm rounded-lg pl-9 pr-4 py-2 w-full focus:outline-none focus:border-[#ff7162] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#131212] border border-neutral-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1c1b1b] text-neutral-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Case ID</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Issue</th>
                <th className="px-6 py-4">Filed On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filtered.length > 0 ? (
                filtered.map((g) => {
                  const isPending = g.status === 'pending'
                  const isResolved = g.status === 'resolved'
                  
                  return (
                    <tr key={g.id} className="hover:bg-[#1a1919] transition-colors">
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${
                          isResolved 
                            ? 'bg-green-500/10 text-green-500 border-green-500/30' 
                            : isPending 
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                        }`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-neutral-500 truncate max-w-[80px]">
                        {g.id.split('-')[0]}
                      </td>
                      <td className="px-6 py-4 font-bold text-white uppercase">{g.platform}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-neutral-300 font-medium">{g.issue_type}</p>
                        <p className="text-[10px] text-neutral-500 truncate max-w-[200px] mt-0.5">{g.description}</p>
                      </td>
                      <td className="px-6 py-4 text-neutral-500 text-xs">
                        {new Date(g.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                         <div className="flex items-center justify-end gap-2">
                           {g.pdf_url && (
                             <a href={g.pdf_url} target="_blank" rel="noopener noreferrer" title="View Case PDF">
                               <button className="p-2 bg-[#1c1b1b] border border-neutral-800 rounded-lg hover:border-[#ff7162]/50 text-neutral-400 hover:text-[#ff7162] transition-all">
                                 <FileWarning className="w-4 h-4" />
                               </button>
                             </a>
                           )}
                           
                           {isPending && (
                             <button 
                               onClick={() => updateStatus(g.id, 'resolved')}
                               className="px-3 py-1.5 bg-[#3fe56c]/10 hover:bg-[#3fe56c]/20 border border-[#3fe56c]/30 text-[#3fe56c] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                             >
                               Resolve
                             </button>
                           )}
                           
                           {!isResolved && !isPending && (
                             <button 
                               onClick={() => updateStatus(g.id, 'resolved')}
                               className="p-2 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg hover:bg-green-500/20"
                             >
                               <CheckCircle className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    <ScrollText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No grievances found matching your search.</p>
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
