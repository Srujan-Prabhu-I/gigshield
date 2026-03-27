import { TrendingUp, Users, Clock, AlertTriangle } from "lucide-react"

export default function PlatformTrends() {
  
  // Mock trend metrics
  const trends = [
    { title: "Active Fleet Size", value: "14,500", growth: "+4.2%", positive: true, icon: Users },
    { title: "Average Shift Length", value: "11.5 hr", growth: "+12%", positive: false, icon: Clock },
    { title: "Grievance Filing Rate", value: "3.2%", growth: "-1.1%", positive: true, icon: AlertTriangle },
    { title: "Retention (30 Days)", value: "82%", growth: "-5%", positive: false, icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#00344b]/30 p-2 rounded-lg border border-[#2fb9f9]/20">
                <TrendingUp className="w-5 h-5 text-[#2fb9f9]" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Worker Trends & Analytics
              </h1>
            </div>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl pl-12">
              Macro-level view of gig worker behavior, retention risks, and supply dynamics.
            </p>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {trends.map((t, i) => (
            <div key={i} className="bg-[#1c1b1b] border border-neutral-800 rounded-[20px] p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-[#131212] p-2 rounded-lg border border-neutral-800">
                  <t.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded border ${
                  t.positive ? 'bg-[#002108]/50 text-[#3fe56c] border-[#3fe56c]/30' : 'bg-[#68000b]/50 text-[#ff7162] border-[#ff7162]/30'
                }`}>
                  {t.growth} vs Last Mo
                </div>
              </div>
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mb-1">{t.title}</p>
              <h3 className="text-3xl font-black text-white">{t.value}</h3>
            </div>
          ))}
        </div>

        {/* Mock Chart Area */}
        <div className="bg-[#131212] border border-neutral-800 rounded-[24px] p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-16 h-16 text-neutral-800 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Algorithm Payout Distribution (Beta)</h3>
          <p className="text-neutral-500 text-sm max-w-md">
            Integration with GigShield standard API required to populate live payout distribution histograms. Upgrade to enterprise features to unlock predictive worker churn analytics.
          </p>
        </div>

      </div>
    </div>
  )
}
