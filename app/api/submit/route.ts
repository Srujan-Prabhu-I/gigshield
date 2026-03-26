import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Generate a fallback device id (client normally provides it via getDeviceId()).
    const deviceId =
      body.device_id ??
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : null)

    // 1) Preserve existing leaderboard behavior.
    const { data: submissionsData, error: submissionsError } = await supabaseAdmin
      .from("submissions")
      .insert([
        {
          platform: body.platform,
          city: body.city,
          orders_day: body.orders_day ?? 0,
          hours_day: body.hours_day ?? 0,
          monthly_pay: body.monthly_pay ?? 0,
          pay_per_hr: body.actualPayPerHour,
          deficit: body.monthlyDeficit,
        },
      ])

    if (submissionsError) {
      console.error(
        "[api/submit] submissions insert error. payload=",
        {
          platform: body.platform,
          city: body.city,
          orders_day: body.orders_day ?? 0,
          hours_day: body.hours_day ?? 0,
          monthly_pay: body.monthly_pay ?? 0,
          pay_per_hr: body.actualPayPerHour,
          deficit: body.monthlyDeficit,
          device_id: deviceId,
        },
        "error=",
        submissionsError
      )
    } else {
      console.log("[api/submit] submissions insert success:", submissionsData)
    }

    if (submissionsError) {
      return NextResponse.json(
        {
          error: submissionsError.message,
          code: submissionsError.code,
          details: submissionsError.details,
        },
        { status: 500 }
      )
    }

    // 2) Insert into earnings_logs for the new production feature set.
    console.log("[api/submit] earnings_logs insert payload:", {
      platform: body.platform,
      city: body.city,
      orders_per_day: Number(body.orders_day ?? 0),
      hours_per_day: Number(body.hours_day ?? 0),
      monthly_earnings: Number(body.monthly_pay ?? 0),
      calculated_deficit: Number(body.monthlyDeficit ?? 0),
      device_id: deviceId,
      user_id: null,
    })
    const { data: earningsLogsData, error: earningsLogsError } = await supabaseAdmin
      .from("earnings_logs")
      .insert([
        {
          platform: body.platform,
          city: body.city,
          orders_per_day: Number(body.orders_day ?? 0),
          hours_per_day: Number(body.hours_day ?? 0),
          monthly_earnings: Number(body.monthly_pay ?? 0),
          calculated_deficit: Number(body.monthlyDeficit ?? 0),
          device_id: deviceId,
          user_id: null,
        },
      ])

    if (earningsLogsError) {
      console.error(
        "[api/submit] earnings_logs insert error. payload=",
        {
          platform: body.platform,
          city: body.city,
          orders_per_day: Number(body.orders_day ?? 0),
          hours_per_day: Number(body.hours_day ?? 0),
          monthly_earnings: Number(body.monthly_pay ?? 0),
          calculated_deficit: Number(body.monthlyDeficit ?? 0),
          device_id: deviceId,
          user_id: null,
        },
        "error=",
        earningsLogsError
      )
      return NextResponse.json(
        {
          error: earningsLogsError.message,
          code: earningsLogsError.code,
          details: earningsLogsError.details,
        },
        { status: 500 }
      )
    }

    console.log("[api/submit] earnings_logs insert success:", earningsLogsData)

    return NextResponse.json({
      success: true,
      submissions: submissionsData,
      earnings_logs: earningsLogsData,
    })

  } catch (err: any) {
    console.error('Caught exception:', err)
    return NextResponse.json({ 
      error: err.message || 'Unknown error',
      stack: err.stack 
    }, { status: 500 })
  }
}
