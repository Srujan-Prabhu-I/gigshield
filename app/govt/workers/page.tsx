import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Users, Search, Download, ShieldCheck } from "lucide-react"

export default async function GovtWorkersData() {
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

  const { data: logs } = await supabaseAdmin
    .from('earnings_logs')
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
              <div className="bg-[#00344b]/30 p-2 rounded-lg border border-[#2fb9f9]/20">
                <Users className="w-5 h-5 text-[#2fb9f9]" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                National Worker Database
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl pl-12">
              Aggregated shift logs across all platforms. Use this data to track minimum wage violations statewide.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search by Platform or City..." 
                className="bg-[#1c1b1b] border border-neutral-800 text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-[#2fb9f9] transition-colors"
                disabled
              />
            </div>
            <button className="bg-[#2fb9f9]/10 hover:bg-[#2fb9f9]/20 border border-[#2fb9f9]/30 text-[#2fb9f9] text-sm font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#131212] border border-neutral-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1c1b1b] text-neutral-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submission ID</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Total Earnings</th>
                <th className="px-6 py-4">Total Hours</th>
                <th className="px-6 py-4">Effective Rate</th>
                <th className="px-6 py-4">Legal Deficit</th>
                <th className="px-6 py-4">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {logs && logs.length > 0 ? (
                logs.map((log) => {
                  const effectiveRate = log.total_earnings / log.total_hours
                  const isUnderpaid = log.deficit > 0
                  
                  return (
                    <tr key={log.id} className="hover:bg-[#1a1919] transition-colors">
                      <td className="px-6 py-4">
                        {isUnderpaid ? (
                          <span className="bg-[#68000b]/50 text-[#ff7162] border border-[#ff7162]/20 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Violation</span>
                        ) : (
                          <span className="bg-[#002108]/50 text-[#3fe56c] border border-[#3fe56c]/20 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider">Compliant</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-neutral-500">{log.id.split('-')[0]}...</td>
                      <td className="px-6 py-4 font-bold text-white uppercase">{log.platform_name || 'UNKNOWN'}</td>
                      <td className="px-6 py-4 font-medium text-white">₹{log.total_earnings}</td>
                      <td className="px-6 py-4 text-neutral-300">{log.total_hours} hr</td>
                      <td className="px-6 py-4 text-neutral-300">₹{effectiveRate.toFixed(1)}/hr</td>
                      <td className={`px-6 py-4 font-bold ${isUnderpaid ? 'text-[#ff7162]' : 'text-neutral-500'}`}>
                        {isUnderpaid ? `₹${log.deficit}` : '₹0'}
                      </td>
                      <td className="px-6 py-4 text-neutral-500 text-xs">
                        {new Date(log.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-neutral-500">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No shifts logged in the platform yet.
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
