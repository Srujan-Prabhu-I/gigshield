import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Allow gov or platform to update grievance status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { grievanceId, status } = body

    if (!grievanceId || !status) {
      return NextResponse.json({ error: "Missing grievanceId or status" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('grievances')
      .update({ status })
      .eq('id', grievanceId)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, grievance: data[0] })
  } catch (error: any) {
    console.error("Grievance update error:", error)
    return NextResponse.json({ error: error.message || "Failed to update grievance status" }, { status: 500 })
  }
}

// Fetch grievances by user or platform
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const platform = searchParams.get('platform')

    let query = supabaseAdmin.from('grievances').select('*').order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    if (platform) {
      query = query.eq('platform_name', platform)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ grievances: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch grievances" }, { status: 500 })
  }
}
