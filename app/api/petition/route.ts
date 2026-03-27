import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { platform, city, issue_type, description, language, userName, address, phone } = body

    if (!platform || !city || !issue_type || !description) {
      return NextResponse.json(
        { error: "Missing required fields: platform, city, issue_type, description" },
        { status: 400 }
      )
    }

    // Generate formal complaint letter via Groq
    const langInstruction = 
      language === "hi" ? "Write the ENTIRE letter in Hindi language." :
      language === "te" ? "Write the ENTIRE letter in Telugu language." :
      "Write the ENTIRE letter in English language."

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            `You are a legal assistant helping Indian gig workers file formal complaints. Generate a formal complaint letter addressed to: The Labour Commissioner, Government of Telangana. Reference Telangana Gig and Platform Workers Act 2025 (sections 12, 15, 18). Demand investigation and compensation. 
            
            IMPORTANT: Use the following worker details in the letter header and signature. DO NOT use placeholders like [Your Name] or [Insert Date].
            Worker Name: ${userName || "Anonymous Gig Worker"}
            Address: ${address || "Hyderabad, Telangana"}
            Phone: ${phone || "Not Provided"}
            Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            
            Keep it under 400 words. Tone: formal, legally credible. ${langInstruction}`,
        },
        {
          role: "user",
          content: `Platform: ${platform}\nCity: ${city}\nIssue Type: ${issue_type}\nDescription: ${description}`,
        },
      ],
    })

    const letter = completion.choices[0]?.message?.content ?? ""

    // Save to Supabase grievances table
    const { error: dbError } = await supabaseAdmin.from("grievances").insert([
      {
        platform,
        city,
        issue_type,
        description,
        created_at: new Date().toISOString(),
      },
    ])

    if (dbError) {
      console.error("Supabase insert error:", dbError)
      // Non-fatal — letter still returned to user
    }

    return NextResponse.json({ letter })
  } catch (error: any) {
    console.error("Petition API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate complaint letter" },
      { status: 500 }
    )
  }
}
