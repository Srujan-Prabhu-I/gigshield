import { NextRequest, NextResponse } from "next/server"
import { calculateUnderpayment } from "@/lib/calculator"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { platform, city, ordersPerDay, hoursPerDay, monthlyPay } = body

    if (!platform || !city || !ordersPerDay || !hoursPerDay || !monthlyPay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = calculateUnderpayment({
      platform, city,
      ordersPerDay: Number(ordersPerDay),
      hoursPerDay: Number(hoursPerDay),
      monthlyPay: Number(monthlyPay),
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 })
  }
}
