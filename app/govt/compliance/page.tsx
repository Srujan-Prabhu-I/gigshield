import { Building2, Search, Download, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function GovtComplianceIndex() {
  
  // Mock data for hackathon demo showing the final index the Gov will use
  const platforms = [
    { id: "P-01", name: "Swiggy", sector: "Food Delivery", workers: 14500, avgWaitTime: "45m", basePay: 85, complianceScore: 42, status: "Warning" },
    { id: "P-02", name: "Zomato", sector: "Food Delivery", workers: 18200, avgWaitTime: "30m", basePay: 92, complianceScore: 65, status: "Monitoring" },
    { id: "P-03", name: "Uber", sector: "Ride Hailing", workers: 22000, avgWaitTime: "15m", basePay: 145, complianceScore: 88, status: "Compliant" },
    { id: "P-04", name: "Rapido", sector: "Ride Hailing", workers: 8400, avgWaitTime: "50m", basePay: 65, complianceScore: 31, status: "Critical" },
    { id: "P-05", name: "Urban Company", sector: "Home Services", workers: 4500, avgWaitTime: "10m", basePay: 180, complianceScore: 92, status: "Compliant" },
    { id: "P-06", name: "Zepto", sector: "Quick Commerce", workers: 3200, avgWaitTime: "60m", basePay: 78, complianceScore: 39, status: "Critical" },
    { id: "P-07", name: "Blinkit", sector: "Quick Commerce", workers: 5100, avgWaitTime: "55m", basePay: 80, complianceScore: 45, status: "Warning" },
    { id: "P-08", name: "Porter", sector: "Logistics", workers: 6800, avgWaitTime: "40m", basePay: 110, complianceScore: 72, status: "Monitoring" },
  ]

  // Sort by lowest compliance score first
  platforms.sort((a, b) => a.complianceScore - b.complianceScore)

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#2d2100]/30 p-2 rounded-lg border border-[#f9a826]/20">
                <Building2 className="w-5 h-5 text-[#f9a826]" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Platform Compliance Index
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl pl-12">
              National ranking of aggregator platforms based on algorithmic transparency, fair pay, and grievance resolution times.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search Platform..." 
                className="bg-[#1c1b1b] border border-neutral-800 text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-[#f9a826] transition-colors"
                disabled
              />
            </div>
            <button className="bg-[#f9a826]/10 hover:bg-[#f9a826]/20 border border-[#f9a826]/30 text-[#f9a826] text-sm font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#131212] border border-neutral-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1c1b1b] text-neutral-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Platform Name</th>
                <th className="px-6 py-4">Sector</th>
                <th className="px-6 py-4">Reg. Workers</th>
                <th className="px-6 py-4">Avg Base Pay</th>
                <th className="px-6 py-4">Avg Resol. Wait</th>
                <th className="px-6 py-4">Compliance Score</th>
                <th className="px-6 py-4">Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {platforms.map((p) => (
                <tr key={p.id} className="hover:bg-[#1a1919] transition-colors">
                  <td className="px-6 py-4">
                    {p.status === 'Critical' ? (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#68000b]/50 border border-[#ff7162]/30">
                        <AlertTriangle className="w-4 h-4 text-[#ff7162]" />
                      </span>
                    ) : p.status === 'Warning' ? (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2d2100]/50 border border-[#f9a826]/30">
                        <AlertTriangle className="w-4 h-4 text-[#f9a826]" />
                      </span>
                    ) : p.status === 'Monitoring' ? (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00344b]/50 border border-[#2fb9f9]/30">
                        <Search className="w-4 h-4 text-[#2fb9f9]" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#002108]/50 border border-[#3fe56c]/30">
                        <CheckCircle2 className="w-4 h-4 text-[#3fe56c]" />
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white uppercase text-base">{p.name}</div>
                    <div className="font-mono text-[10px] text-neutral-500">ID: {p.id}</div>
                  </td>
                  <td className="px-6 py-4 text-neutral-300">{p.sector}</td>
                  <td className="px-6 py-4 font-medium text-white">{p.workers.toLocaleString()}</td>
                  <td className="px-6 py-4 text-neutral-300">₹{p.basePay}/hr</td>
                  <td className={`px-6 py-4 font-bold ${parseInt(p.avgWaitTime) > 40 ? 'text-[#ff7162]' : 'text-neutral-400'}`}>
                    {p.avgWaitTime}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-black ${
                        p.status === 'Critical' ? 'text-[#ff7162]' : 
                        p.status === 'Warning' ? 'text-[#f9a826]' : 
                        p.status === 'Monitoring' ? 'text-[#2fb9f9]' : 'text-[#3fe56c]'
                      }`}>
                        {p.complianceScore}
                      </span>
                      <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            p.status === 'Critical' ? 'bg-[#ff7162]' : 
                            p.status === 'Warning' ? 'bg-[#f9a826]' : 
                            p.status === 'Monitoring' ? 'bg-[#2fb9f9]' : 'bg-[#3fe56c]'
                          }`}
                          style={{ width: `${p.complianceScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'Critical' ? (
                      <button className="text-[10px] font-bold tracking-widest text-[#0e0e0e] uppercase bg-[#ff7162] hover:bg-[#ff5a4d] px-3 py-1.5 rounded-md transition-colors w-full">
                        Issue Notice
                      </button>
                    ) : p.status === 'Warning' ? (
                      <button className="text-[10px] font-bold tracking-widest text-[#f9a826] uppercase bg-[#2d2100] hover:bg-[#403000] border border-[#f9a826]/30 px-3 py-1.5 rounded-md transition-colors w-full">
                        Audit Reqd
                      </button>
                    ) : (
                      <button className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase bg-[#1c1b1b] px-3 py-1.5 rounded-md transition-colors w-full cursor-default border border-neutral-800">
                        No Action
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
