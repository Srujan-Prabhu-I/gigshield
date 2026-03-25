import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    console.log('ENV CHECK:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20),
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10),
    })

    const body = await req.json()
    console.log('BODY RECEIVED:', JSON.stringify(body))
    console.log('Request body:', body)

    const { data, error } = await supabaseAdmin
      .from('submissions')
      .insert([{
        platform: body.platform,
        city: body.city,
        orders_day: body.orders_day ?? 0,
        hours_day: body.hours_day ?? 0,
        monthly_pay: body.monthly_pay ?? 0,
        pay_per_hr: body.actualPayPerHour,
        deficit: body.monthlyDeficit,
      }])

    if (error) {
      console.error('Supabase error:', JSON.stringify(error))
      return NextResponse.json({ 
        error: error.message, 
        code: error.code,
        details: error.details 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (err: any) {
    console.error('Caught exception:', err)
    return NextResponse.json({ 
      error: err.message || 'Unknown error',
      stack: err.stack 
    }, { status: 500 })
  }
}
