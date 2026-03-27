import { NextRequest, NextResponse } from "next/server"

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
      // Simple penalty calculation: deficit * 100 (as requested)
      const deficit = 100 - score
      estimatedPenalty = deficit * 100
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
    console.error(error)
    return NextResponse.json({ error: "Failed to run platform audit" }, { status: 500 })
  }
}
