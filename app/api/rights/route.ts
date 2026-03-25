import { NextRequest, NextResponse } from "next/server"
import { groq } from "@/lib/groq"

export async function POST(req: NextRequest) {
  try {
    const { language, platform, monthlyDeficit, isUnderpaid } = await req.json()

    const languageMap: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      te: "Telugu",
    }

    const prompt = `You are a legal rights assistant for gig workers in Telangana, India.
    
A gig worker on ${platform} is ${isUnderpaid ? `underpaid by ₹${monthlyDeficit} per month` : "being paid fairly"}.

Based on the Telangana Gig and Platform Workers Act 2025, explain in ${languageMap[language] || "English"}:
1. Their key legal rights under this Act (3 points, simple language)
2. What action they can take right now (2 specific steps)
3. One motivating closing line in their language

Keep it under 150 words. Use simple everyday language a delivery worker can understand.
Do NOT use legal jargon. Respond ONLY in ${languageMap[language] || "English"}.`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    })

    const rights = completion.choices[0]?.message?.content || ""
    return NextResponse.json({ success: true, rights })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rights" }, { status: 500 })
  }
}
