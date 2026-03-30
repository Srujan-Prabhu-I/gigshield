import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      platform,
      avgPay,
      hasInsurance,
      hasGrievance,
      hasMinGuarantee,
      weeklyHours,
    } = body

    if (!platform) {
        return NextResponse.json({ error: "Platform name is required" }, { status: 400 })
    }

    let score = 100
    const violations: string[] = []
    const actionItems: string[] = []

    if (!hasInsurance) {
      score -= 20
      violations.push("No accident insurance coverage")
      actionItems.push("Provide accident insurance for gig workers.")
    }
    if (!hasGrievance) {
      score -= 15
      violations.push("No grievance portal")
      actionItems.push("Create and publish an accessible grievance portal.")
    }
    if (!hasMinGuarantee) {
      score -= 15
      violations.push("No minimum earnings guarantee")
      actionItems.push("Implement a minimum weekly/monthly guarantee policy.")
    }
    if (Number(weeklyHours) > 60) {
      score -= 20
      violations.push("Average weekly hours exceed safe limit")
      actionItems.push("Cap weekly work to reasonable limits.")
    }
    if (Number(avgPay) < 93) {
      score -= 30
      violations.push("Average pay is below Telangana Act minimum (₹93/hr)")
      actionItems.push("Increase payment rates to meet legal standards.")
    }

    score = Math.max(0, Math.min(100, score))
    const status = score > 75 ? "Compliant" : score >= 50 ? "Partially Compliant" : "Non-Compliant"

    // Calculate estimated penalty for non-compliant platforms
    let estimatedPenalty = undefined
    if (score < 50) {
      const deficit = 100 - score
      estimatedPenalty = deficit * 100
    }

    // Persist to database
    // Brute-force cleanup of duplicates before upsert to prevent 406/500 errors
    await supabaseAdmin.from('platform_profiles').delete().eq('platform_name', platform)
    
    // 1. Update legacy platform_rates table
    await supabaseAdmin.from('platform_rates').upsert(
      { 
        platform: platform, 
        compliance_score: score, 
        pay_per_delivery: Number(avgPay) || 0 
      }, 
      { onConflict: 'platform' }
    )

    // 2. Update the new platform_profiles table
    const { error: dbError } = await supabaseAdmin.from('platform_profiles').insert(
      { 
        platform_name: platform, 
        compliance_score: score,
        has_insurance: !!hasInsurance,
        has_grievance_portal: !!hasGrievance,
        has_min_guarantee: !!hasMinGuarantee,
        last_audit_at: new Date().toISOString(),
        audit_data: {
          violations,
          actionItems,
          status,
          weeklyHours: Number(weeklyHours),
          avgPay: Number(avgPay)
        }
      }
    )
    
    if (dbError) {
      console.error("Failed to persist audit to platform_profiles:", dbError)
      // Return 500 if database persistence fails
      return NextResponse.json({ error: "Failed to save audit results", details: dbError }, { status: 500 })
    }

    return NextResponse.json({
      score,
      status,
      violations,
      actionItems: actionItems.slice(0, 3),
      verified: score > 75,
      estimatedPenalty,
    })
  } catch (error) {
    console.error("Audit error:", error)
    return NextResponse.json({ error: "Failed to run platform audit" }, { status: 500 })
  }
}
