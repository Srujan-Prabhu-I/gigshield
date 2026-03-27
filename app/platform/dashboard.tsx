\"use client\"

import { useEffect } from \"react\"
import { useAuth } from \"@/lib/auth-context\"
import { useRouter } from \"next/navigation\"
import Link from \"next/link\"
import { Building2, ShieldCheck, Download, Search, TrendingUp, AlertTriangle, Loader2 } from \"lucide-react\"

export default function PlatformDashboard() {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  // Protect route - redirect if not platform role
  useEffect(() => {
    if (!loading && (!user || role !== \"platform\")) {
      router.push(\"/\")
    }
  }, [user, role, loading, router])

  if (loading || !user || role !== \"platform\") {
    return (
      <div className=\"min-h-screen bg-[#0e0e0e] flex items-center justify-center\">
        <div className=\"text-center\">
          <Loader2 className=\"w-8 h-8 text-[#3fe56c] animate-spin mx-auto mb-4\" />
          <p className=\"text-neutral-400 font-medium\">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const platformName = \"Your Platform\"
  const complianceScore = 65 
  const isCertified = complianceScore >= 75
  const badgeTitle = isCertified ? \"GigShield Verified Fair Employer Status\" : \"Action Required to Achieve Certification\"

  return (
    <div className=\"min-h-screen bg-[#0e0e0e] text-white p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500\">
      <div className=\"max-w-6xl mx-auto space-y-10\">
        
        {/* Header */}
        <div className=\"flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-800 pb-6\">
          <div>
            <div className=\"flex items-center gap-3 mb-2\">
              <div className=\"bg-[#00344b]/30 p-2 rounded-lg border border-[#2fb9f9]/20\">
                <Building2 className=\"w-5 h-5 text-[#2fb9f9]\" />
              </div>
              <h1 className=\"text-3xl md:text-4xl font-black tracking-tight text-white uppercase\">
                {platformName} HQ
              </h1>
            </div>
            <p className=\"text-neutral-400 text-sm md:text-base max-w-2xl pl-12\">
              Your centralized dashboard to monitor compliance, track worker retention, and maintain your Fair Pay Certification.
            </p>
          </div>
          
          <div className=\"flex flex-wrap gap-3\">
            <Link href=\"/platform/audit\">
              <button className=\"bg-[#1c1b1b] hover:bg-[#201f1f] border border-[#2fb9f9]/30 hover:border-[#2fb9f9] text-[#2fb9f9] text-sm font-bold py-2.5 px-5 rounded-lg transition-all\">
                Run Self-Audit
              </button>
            </Link>
          </div>
        </div>

        <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-8\">
          
          {/* Main Score Widget */}
          <div className=\"lg:col-span-2 space-y-8\">
            <div className={`rounded-[32px] p-8 md:p-10 relative overflow-hidden border ${isCertified ? 'bg-[#002108] border-[#3fe56c]/30' : 'bg-[#1c1b1b] border-neutral-800'}`}>
              <div className=\"absolute top-0 right-0 p-8 opacity-20\">
                {isCertified ? <ShieldCheck className=\"w-48 h-48 text-[#3fe56c]\" /> : <AlertTriangle className=\"w-48 h-48 text-[#f9a826]\" />}
              </div>
              
              <div className=\"relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 w-full\">
                <div>
                  <div className=\"flex items-center gap-2 mb-4\">
                    <span className=\"bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full\">Overall Rating</span>
                  </div>
                  <h2 className=\"text-6xl md:text-8xl font-black tracking-tighter mb-2 flex items-baseline gap-2\">
                    {complianceScore} <span className=\"text-xl md:text-3xl font-bold text-neutral-500\">/ 100</span>
                  </h2>
                  <p className=\"text-lg font-medium text-neutral-300 max-w-md\">
                    {badgeTitle}
                  </p>
                </div>
                
                <div className=\"md:text-right flex flex-col items-start md:items-end w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-neutral-800 md:border-l pl-0 md:pl-8\">
                   <p className=\"text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4\">Certification Status</p>
                   {isCertified ? (
                     <div className=\"bg-[#3fe56c]/20 border border-[#3fe56c]/50 text-[#3fe56c] font-black text-lg px-6 py-3 rounded-xl uppercase tracking-wide\">
                       Verified Shield
                     </div>
                   ) : (
                     <div className=\"space-y-4 w-full\">
                       <div className=\"bg-[#2d2100] border border-[#f9a826]/50 text-[#f9a826] font-black text-lg px-6 py-3 rounded-xl uppercase tracking-wide shadow-inner\">
                         Unverified
                       </div>
                       <div className=\"bg-neutral-900 rounded-full h-2 w-full md:w-48 overflow-hidden\">
                         <div className=\"bg-[#f9a826] h-full\" style={{ width: `${complianceScore}%` }}></div>
                       </div>
                       <p className=\"text-xs font-bold text-neutral-400\">10 points to certification</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className=\"space-y-6\">
            <Link href=\"/platform/competitors\" className=\"block group\">
              <div className=\"bg-[#1c1b1b] hover:bg-[#201f1f] border border-neutral-800 hover:border-[#2fb9f9]/50 transition-colors p-6 rounded-2xl flex items-start gap-4 h-full\">
                <div className=\"bg-[#00344b]/30 p-3 rounded-xl border border-[#2fb9f9]/20 group-hover:scale-110 transition-transform\">
                  <Search className=\"w-5 h-5 text-[#2fb9f9]\" />
                </div>
                <div>
                  <h3 className=\"text-lg font-bold text-white mb-1\">Competitor Intel</h3>
                  <p className=\"text-xs text-neutral-400 font-medium\">Benchmark your platform's pay rates.</p>
                </div>
              </div>
            </Link>

            <Link href=\"/platform/trends\" className=\"block group\">
              <div className=\"bg-[#1c1b1b] hover:bg-[#201f1f] border border-neutral-800 hover:border-[#2fb9f9]/50 transition-colors p-6 rounded-2xl flex items-start gap-4 h-full\">
                <div className=\"bg-[#00344b]/30 p-3 rounded-xl border border-[#2fb9f9]/20 group-hover:scale-110 transition-transform\">
                  <TrendingUp className=\"w-5 h-5 text-[#2fb9f9]\" />
                </div>
                <div>
                  <h3 className=\"text-lg font-bold text-white mb-1\">Worker Trends</h3>
                  <p className=\"text-xs text-neutral-400 font-medium\">View statewide analytics.</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
