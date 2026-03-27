import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { ScrollText, Search, Download, FileWarning, ExternalLink } from "lucide-react"

export default async function GovtComplaintsData() {
  const cookieStore = await cookies()
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      }
    }
  )

  const { data: grievances } = await supabaseAdmin
    .from('grievances')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

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
              <h1 className="text-3xl font-black tracking-tight text-white">
                Formal Grievance Portal
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl pl-12">
              Review AI-generated complaint letters filed by workers under the Platform Act.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search Complaints..." 
                className="bg-[#1c1b1b] border border-neutral-800 text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-[#ff7162] transition-colors"
                disabled
              />
            </div>
            <button className="bg-[#ff7162]/10 hover:bg-[#ff7162]/20 border border-[#ff7162]/30 text-[#ff7162] text-sm font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#131212] border border-neutral-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1c1b1b] text-neutral-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Action Status</th>
                <th className="px-6 py-4">Case ID</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4 max-w-xs">Grievance Target</th>
                <th className="px-6 py-4">Filed On</th>
                <th className="px-6 py-4">Official Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {grievances && grievances.length > 0 ? (
                grievances.map((g) => (
                  <tr key={g.id} className="hover:bg-[#1a1919] transition-colors">
                    <td className="px-6 py-4">
                      {g.pdf_url ? (
                        <span className="bg-[#f9a826]/10 text-[#f9a826] border border-[#f9a826]/30 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Requires Review</span>
                      ) : (
                        <span className="bg-[#1c1b1b] text-neutral-500 border border-neutral-800 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Processing Gen</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">{g.id.split('-')[0]}...</td>
                    <td className="px-6 py-4 font-bold text-white uppercase">{g.platform_name || 'UNKNOWN'}</td>
                    <td className="px-6 py-4">
                      <p className="truncate max-w-[300px] text-neutral-300">
                        Violations cited in {g.platform_name} automated payout algos.
                      </p>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">
                      {new Date(g.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {g.pdf_url ? (
                        <a href={g.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-[#ff7162] hover:text-[#ff5a4d] transition-colors">
                          <FileWarning className="w-4 h-4" /> View PDF Case <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-600 font-medium">Pending Intel...</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    <ScrollText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No formal grievances have been filed yet.
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
