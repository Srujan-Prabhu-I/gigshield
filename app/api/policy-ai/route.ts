import { Groq } from "groq-sdk"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(req: Request) {
  try {
    const { objective, context } = await req.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        error: "GROQ_API_KEY is not configured. Please add it to your environment variables." 
      }, { status: 500 })
    }

    // Fetch real data to ground the AI
    const { data: grievances } = await supabase
      .from('grievances')
      .select('issue_type, platform')
      .limit(100)

    const issueCounts: Record<string, number> = {}
    grievances?.forEach(g => {
        issueCounts[g.issue_type] = (issueCounts[g.issue_type] || 0) + 1
    })

    const topIssues = Object.entries(issueCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([type, count]) => `${type} (${count} cases)`)
        .join(", ")

    const prompt = `
      You are a Senior Policy Consultant for the Government of Telangana, specializing in Digital Labor Rights and the Gig Economy.
      
      Objective: ${objective}
      
      Live Context from GigShield Database:
      - Top 3 Worker Grievances: ${topIssues}
      - Additional User Context: ${context || "None provided"}
      
      Task: Draft a formal legislative policy or regulatory amendment to address these issues. 
      Use local legal terminology (referencing the 'Telangana Gig and Platform Workers Act' if applicable).
      The drafting should be professional, enforceable, and data-driven.
      
      Format:
      1. Title of Regulation
      2. Preamble (Why this is needed)
      3. Key Provisions (Bullet points)
      4. Enforcement Mechanisms
      5. Impact Projection
    `

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    })

    return NextResponse.json({ 
      policy: completion.choices[0]?.message?.content 
    })

  } catch (err: any) {
    console.error("AI Policy Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
