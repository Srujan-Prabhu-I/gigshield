"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Gavel, UserCheck, ShieldAlert, BookOpen, Users } from "lucide-react"

const rightsDefinitions = {
  en: [
    { key: "minimum_wage", title: "Right to Minimum Wage", text: "You must earn at least ₹93/hour under Telangana law" },
    { key: "grievance", title: "Right to Grievance Redressal", text: "Platform must resolve complaints within 30 days" },
    { key: "social_security", title: "Right to Social Security", text: "Platform must contribute to your accident insurance" },
    { key: "deactivation", title: "Right Against Arbitrary Deactivation", text: "You cannot be deactivated without written reason" },
    { key: "transparency", title: "Right to Transparency", text: "Platform must explain how your pay is calculated" },
    { key: "collective", title: "Right to Collective Action", text: "You can form unions and strike legally" },
  ],
  hi: [
    { key: "minimum_wage", title: "न्यूनतम वेतन का अधिकार", text: "तेलंगाना कानून के तहत, आपको कम से कम ₹93/घंटा मिलना चाहिए" },
    { key: "grievance", title: "शिकायत निवारण का अधिकार", text: "प्लेटफॉर्म को 30 दिनों के भीतर शिकायतों का समाधान करना चाहिए" },
    { key: "social_security", title: "सामाजिक सुरक्षा का अधिकार", text: "प्लेटफॉर्म को आपकी दुर्घटना बीमा में योगदान देना चाहिए" },
    { key: "deactivation", title: "अप्रथागत निष्कासन के खिलाफ अधिकार", text: "आपको लिखित कारण के बिना निष्क्रिय नहीं किया जा सकता" },
    { key: "transparency", title: "पारदर्शिता का अधिकार", text: "प्लेटफॉर्म को यह स्पष्ट करना चाहिए कि आपकी वेतन कैसे गणना की जाती है" },
    { key: "collective", title: "सामूहिक कार्रवाई का अधिकार", text: "आप कानूनी रूप से यूनियन बना सकते हैं और हड़ताल कर सकते हैं" },
  ],
  te: [
    { key: "minimum_wage", title: "నబు వేతన హక్కు", text: "తెలంగాణ చట్టం ప్రకారం మీకు కనీసం ₹93/గంట వస్తుంది" },
    { key: "grievance", title: "పింతు పరిష్కార హక్కు", text: "ప్లాట్‌ఫామ్ 30 రోజుల్లో లోపాలను పరిష్కరించాలి" },
    { key: "social_security", title: "సామాజిక భద్రత హక్కు", text: "ప్లాట్‌ఫామ్ మీ ప్రమాద బీమాకు దోహదం చేయాలి" },
    { key: "deactivation", title: "యాదృచ్ఛిక డీ ఆక్టివేషన్‌కు వ్యతిరేక హక్కు", text: "లిఖిత కారణం లేకుండా మీరు నిలిపివేయకూడదు" },
    { key: "transparency", title: "పారదర్శకత హక్కు", text: "ప్లాట్‌ఫామ్ మీ జీతాన్ని ఎలా గణిస్తుంది అని వివరించాలి" },
    { key: "collective", title: "సమూహ చర్య హక్కు", text: "మీరు ఐక్యంతోనూ శ్రమించవచ్చు" },
  ],
}

const iconMap: Record<string, React.ReactNode> = {
  minimum_wage: <UserCheck className="w-5 h-5 text-[#3fe56c]" />,
  grievance: <ShieldAlert className="w-5 h-5 text-[#3fe56c]" />,
  social_security: <ShieldCheck className="w-5 h-5 text-[#3fe56c]" />,
  deactivation: <Gavel className="w-5 h-5 text-[#3fe56c]" />,
  transparency: <BookOpen className="w-5 h-5 text-[#3fe56c]" />,
  collective: <Users className="w-5 h-5 text-[#3fe56c]" />,
}

export default function WorkerRightsPage() {
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en")
  const [details, setDetails] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [latestEntry, setLatestEntry] = useState<any | null>(null)
  const [cityBelowMinPct, setCityBelowMinPct] = useState<number | null>(null)
  const [rightsInsightMessage, setRightsInsightMessage] = useState<string>("")

  const rights = rightsDefinitions[language]

  useEffect(() => {
    const loadLatest = async () => {
      const { data: latestData, error: latestError } = await supabase
        .from("earnings_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)

      if (latestError) {
        console.error("Failed to fetch latest earnings log", latestError)
        setRightsInsightMessage("No recent earnings data available.")
        return
      }

      const entry = latestData?.[0] || null
      setLatestEntry(entry)

      if (!entry) {
        setRightsInsightMessage("No earnings logs yet — be the first contributor")
        return
      }

      const actualPerHour = ((Number(entry.monthly_earnings) || 0) / ((Number(entry.hours_per_day) || 0) * 4)) || 0
      const gapPerHour = Number(entry.calculated_deficit) ? (Number(entry.calculated_deficit) / ((Number(entry.hours_per_day) || 0) * 4)) : 0

      setRightsInsightMessage(`⚠️ You are earning ₹${actualPerHour.toFixed(0)}/hr — Minimum required: ₹93/hr — Deficit: ₹${gapPerHour.toFixed(0)}/hr`)

      const { data: cityData, error: cityError } = await supabase
        .from("earnings_logs")
        .select("monthly_earnings")
        .eq("city", entry.city)

      if (cityError || !cityData) {
        return
      }

      const cityStats = cityData as any[]
      const belowCount = cityStats.filter((item) => (Number(item.monthly_earnings) || 0) < 93 * 8 * 26 / 12).length
      const percent = cityStats.length ? (belowCount / cityStats.length) * 100 : 0
      setCityBelowMinPct(percent)
    }

    loadLatest()
  }, [])

  const handleKnowMore = async (key: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/rights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, platform: "All", monthlyDeficit: 0, isUnderpaid: true }),
      })

      const data = await res.json()
      setDetails(data.rights ?? "No detailed rights available")
    } catch (err) {
      console.error(err)
      setDetails("Failed to load details")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white pt-8 px-4 sm:px-6 lg:px-10 pb-28">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black">Your Rights. In Your Language.</h1>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {[
              { label: "EN", code: "en" },
              { label: "HI", code: "hi" },
              { label: "TE", code: "te" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as "en" | "hi" | "te")}
                className={`px-4 py-2 rounded-lg font-bold text-sm ${language === lang.code ? "bg-[#3fe56c] text-black" : "bg-[#131313] text-neutral-300"}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <Card className="border border-neutral-800 bg-[#1c1b1b] p-4">
          <p className="text-sm text-neutral-300">{rightsInsightMessage || "No recent entries yet."}</p>
          {cityBelowMinPct !== null && (
            <p className="text-sm text-[#facc15]">
              {cityBelowMinPct.toFixed(0)}% workers in your city earn below minimum wage
            </p>
          )}
          <div className="mt-3">
            <Link href="/grievance">
              <Button className="w-full py-2 bg-gradient-to-br from-[#3fe56c] to-[#00c853] text-black">Report Violation</Button>
            </Link>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rights.map((right) => (
            <Card key={right.key} className="border border-neutral-800 bg-[#1c1b1b]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span>{iconMap[right.key]}</span>
                  <div>
                    <h2 className="font-bold text-lg">{right.title}</h2>
                    <p className="text-neutral-300 text-sm mt-1">{right.text}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleKnowMore(right.key)}
                  className="mt-3 px-3 py-2 text-xs"
                >
                  Know More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-[#1c1b1b] border border-neutral-800 p-4 rounded-lg">
          <p className="font-semibold mb-2">Detailed Rights Explanation</p>
          <p className="text-sm text-neutral-300">{loading ? "Loading..." : details || "Click a card to load details."}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/checker" className="block">
            <Button className="w-full py-3 bg-gradient-to-br from-[#3fe56c] to-[#00c853] text-black">Check My Pay</Button>
          </Link>
          <Link href="/grievance" className="block">
            <Button className="w-full py-3 bg-gradient-to-br from-[#3fe56c] to-[#00c853] text-black">File Complaint</Button>
          </Link>
          <Link href="/leaderboard" className="block">
            <Button className="w-full py-3 bg-gradient-to-br from-[#3fe56c] to-[#00c853] text-black">See Exploitation Index</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
