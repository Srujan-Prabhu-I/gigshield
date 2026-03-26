import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      platformName,
      avgPayPerDelivery,
      accidentInsurance,
      grievancePortal,
      minEarningsGuarantee,
      weeklyHours,
    } = body

    let score = 50
    const violations: string[] = []
    const actionItems: string[] = []

    if (!accidentInsurance) {
      score -= 20
      violations.push("No accident insurance coverage")
      actionItems.push("Provide accident insurance for gig workers.")
    }
    if (!grievancePortal) {
      score -= 15
      violations.push("No grievance portal")
      actionItems.push("Create and publish an accessible grievance portal.")
    }
    if (!minEarningsGuarantee) {
      score -= 15
      violations.push("No minimum earnings guarantee")
      actionItems.push("Implement a minimum weekly/ monthly guarantee policy.")
    }
    if (Number(weeklyHours) > 60) {
      score -= 10
      violations.push("Average weekly hours exceed safe limit")
      actionItems.push("Cap weekly work to reasonable limits and rotate shifts.")
    }
    if (Number(avgPayPerDelivery) < 70) {
      score -= 10
      violations.push("Average pay is below fair threshold")
      actionItems.push("Increase payment rates per delivery/km.")
    }

    score = Math.max(0, Math.min(100, score))
    const status = score > 75 ? "Compliant" : score >= 50 ? "Partially Compliant" : "Non-Compliant"

    return NextResponse.json({
      score,
      status,
      violations,
      actionItems: actionItems.slice(0, 3),
      verified: score > 75,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to run platform audit" }, { status: 500 })
  }
}
