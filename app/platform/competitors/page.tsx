import { Search, Building2, BarChart3, TrendingUp, ShieldCheck } from "lucide-react"

export default function PlatformCompetitors() {
  
  // Mocked platform data for hackathon demo
  const platforms = [
    { name: "Swiggy", avgPay: 85, workers: 14500, deficitRatio: "12%", score: 42 },
    { name: "Zomato", avgPay: 92, workers: 18200, deficitRatio: "8%", score: 65 },
    { name: "Uber", avgPay: 145, workers: 22000, deficitRatio: "3%", score: 88 },
    { name: "Rapido", avgPay: 65, workers: 8400, deficitRatio: "25%", score: 31 },
    { name: "Urban Company", avgPay: 180, workers: 4500, deficitRatio: "2%", score: 92 },
    { name: "Zepto", avgPay: 78, workers: 3200, deficitRatio: "18%", score: 39 },
  ]

  // Sort by average pay descending
  platforms.sort((a, b) => b.avgPay - a.avgPay)

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#00344b]/30 p-2 rounded-lg border border-[#2fb9f9]/20">
                <Search className="w-5 h-5 text-[#2fb9f9]" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Competitor Intelligence
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl pl-12">
              Live benchmarking of your platform's base pay and worker retention against industry standards.
            </p>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#1c1b1b] border border-neutral-800 rounded-[20px] p-6">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
               Industry Average Pay <TrendingUp className="w-4 h-4 text-[#3fe56c]" />
            </p>
            <h3 className="text-3xl font-black text-white">₹107.5/hr</h3>
          </div>
          <div className="bg-[#1c1b1b] border border-neutral-800 rounded-[20px] p-6">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
               Market Leader Rate <Building2 className="w-4 h-4 text-[#2fb9f9]" />
            </p>
            <h3 className="text-3xl font-black text-white">₹180/hr</h3>
            <p className="text-xs text-neutral-400 mt-1">Urban Company</p>
          </div>
          <div className="bg-[#1c1b1b] border border-neutral-800 rounded-[20px] p-6">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
               Highest Exploitation <ShieldCheck className="w-4 h-4 text-[#ff7162]" />
            </p>
            <h3 className="text-3xl font-black text-[#ff7162]">Rapido</h3>
            <p className="text-xs text-neutral-400 mt-1">25% deficit ratio tracking.</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#131212] border border-neutral-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1c1b1b] text-neutral-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Actively Working</th>
                <th className="px-6 py-4">Avg Hourly Pay</th>
                <th className="px-6 py-4">Est. Deficit Ratio</th>
                <th className="px-6 py-4">GigShield Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {platforms.map((p, index) => (
                <tr key={p.name} className="hover:bg-[#1a1919] transition-colors">
                  <td className="px-6 py-4 font-bold text-neutral-500">#{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-white uppercase text-base">{p.name}</td>
                  <td className="px-6 py-4 font-medium text-white">{p.workers.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white font-bold">₹{p.avgPay}</td>
                  <td className={`px-6 py-4 font-bold ${parseInt(p.deficitRatio) > 15 ? 'text-[#ff7162]' : 'text-neutral-400'}`}>
                    {p.deficitRatio}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-black ${
                      p.score < 50 ? 'text-[#ff7162]' : 
                      p.score >= 80 ? 'text-[#3fe56c]' : 'text-[#f9a826]'
                    }`}>
                      {p.score}/100
                    </span>
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
