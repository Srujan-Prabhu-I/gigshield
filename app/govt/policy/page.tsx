"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollText, FileText, Sparkles, Send, Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { jsPDF } from "jspdf"

export default function PolicyGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [policyObjective, setPolicyObjective] = useState("")
  const [draftedPolicy, setDraftedPolicy] = useState("")
  const [stats, setStats] = useState({ totalGrievances: 0, topIssue: "N/A", avgDeficit: 0 })

  useEffect(() => {
    async function loadStats() {
      const { count } = await supabase.from('grievances').select('*', { count: 'exact', head: true })
      const { data: logs } = await supabase.from('earnings_logs').select('calculated_deficit')
      
      const avg = logs && logs.length > 0 
        ? logs.reduce((acc, l) => acc + (l.calculated_deficit || 0), 0) / logs.length 
        : 0
        
      setStats({
        totalGrievances: count || 0,
        topIssue: "Wage Theft / Algorithmic Deviation",
        avgDeficit: Math.round(avg)
      })
    }
    loadStats()
  }, [])

  const handleGenerate = async () => {
    if (!policyObjective.trim()) {
      toast.error("Please enter a policy objective (e.g. 'Mandatory Accident Insurance')")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/policy-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: policyObjective,
          context: `Current system shows ${stats.totalGrievances} complaints with an average wage deficit of ₹${stats.avgDeficit}.`
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate policy")

      setDraftedPolicy(data.policy)
      toast.success("Legislative draft generated!")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "AI Service currently unavailable")
      // Mock for demo if GROQ key is missing
      if (err.message.includes("GROQ_API_KEY")) {
        setDraftedPolicy("# MOCK REGULATION: Gig Worker Protection Act\n\n## 1. Title\nStandardized Social Security for On-Demand Workers\n\n## 2. Preamble\nRecognizing the growing reliance on gig platforms, the Government of Telangana hereby mandates standardized insurance for all active workers.\n\n## 3. Provisions\n- Platforms must contribute 2% of transaction value to the Welfare Fund.\n- Mandatory Accident Insurance of ₹5,00,000 for every active partner.\n- One-tap grievance escalation to the Labor Commissioner.")
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text("Government of Telangana: Policy Draft", 20, 20)
    doc.setFontSize(10)
    doc.text(`Generated via GigShield Intelligence on ${new Date().toLocaleDateString()}`, 20, 30)
    
    const splitText = doc.splitTextToSize(draftedPolicy, 180)
    doc.text(splitText, 20, 45)
    doc.save("GigShield_Policy_Draft.pdf")
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#4d0091]/30 p-2 rounded-lg border border-[#a855f7]/20">
                <Sparkles className="w-5 h-5 text-[#a855f7]" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                AI Policy Drafter
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl pl-12 italic">
              Empowering regulators with data-driven legislative drafting tools.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-[#131212] border-neutral-800 rounded-2xl overflow-hidden relative">
              <CardHeader className="bg-[#1c1b1b]/50 border-b border-neutral-800/50">
                 <CardTitle className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <AlertCircle className="w-4 h-4 text-[#ff7162]" /> 
                   System Intelligence
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div>
                   <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Unresolved Grievances</p>
                   <p className="text-3xl font-black text-white">{stats.totalGrievances}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Weighted Wage Deficit</p>
                   <p className="text-3xl font-black text-white">₹{stats.avgDeficit}<span className="text-sm font-normal text-neutral-500">/hr</span></p>
                 </div>
                 <div className="pt-4 border-t border-neutral-800/50">
                   <div className="bg-[#1c1b1b] rounded-lg p-3 border border-neutral-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#3fe56c] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-neutral-400 leading-relaxed font-medium">Ready for Legislative Processing based on current violation trends.</p>
                   </div>
                 </div>
              </CardContent>
            </Card>
            
            <div className="bg-[#1c1b1b] border border-neutral-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Drafting Goal</h3>
              <textarea 
                placeholder="e.g. Standardize 2% Revenue Sharing for Worker Welfare Fund..."
                className="w-full bg-[#131212] border border-neutral-800 rounded-xl p-4 text-sm text-neutral-200 min-h-[120px] focus:outline-none focus:border-[#a855f7] transition-all"
                value={policyObjective}
                onChange={(e) => setPolicyObjective(e.target.value)}
              />
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-[#a855f7] hover:bg-[#9333ea] text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "Analyzing..." : "Draft Protocol"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#131212] border border-neutral-800 rounded-3xl h-full min-h-[500px] flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <ScrollText className="w-64 h-64" />
               </div>
               
               <div className="p-8 border-b border-neutral-800/50 flex justify-between items-center z-10 relative bg-[#1c1b1b]/30">
                  <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#a855f7]" /> Legislative Workspace
                  </h3>
                  {draftedPolicy && (
                    <button 
                      onClick={downloadPDF}
                      className="text-[10px] font-black uppercase text-white bg-[#1c1b1b] border border-neutral-700 px-3 py-1.5 rounded-lg hover:border-white transition-all flex items-center gap-2"
                    >
                      <Download className="w-3 h-3" /> Export Draft
                    </button>
                  )}
               </div>

               <div className="flex-1 p-8 md:p-12 z-10 relative overflow-y-auto max-h-[600px] scrollbar-hide">
                  {!draftedPolicy && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                      <div className="bg-neutral-800 p-4 rounded-full">
                        <Sparkles className="w-8 h-8 text-neutral-500" />
                      </div>
                      <p className="text-sm text-neutral-500 max-w-xs font-medium">Input your legislative objective to generate a data-backed policy draft.</p>
                    </div>
                  )}

                  {loading && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                       <div className="relative">
                         <div className="w-16 h-16 border-4 border-[#a855f7]/20 border-t-[#a855f7] rounded-full animate-spin"></div>
                         <Sparkles className="w-6 h-6 text-[#a855f7] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                       </div>
                       <div className="space-y-1">
                         <p className="text-sm font-black uppercase tracking-widest">Aggregating Global Trends</p>
                         <p className="text-xs text-neutral-500">Cross-referencing {stats.totalGrievances} grievances...</p>
                       </div>
                    </div>
                  )}

                  {draftedPolicy && !loading && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                      <pre className="text-neutral-200 text-sm font-sans leading-relaxed whitespace-pre-wrap selection:bg-[#a855f7]/30">
                        {draftedPolicy}
                      </pre>
                    </div>
                  )}
               </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
