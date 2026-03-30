import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    // Direct SQL query via Supabase to check columns
    const { data: profileColumns, error: pError } = await supabaseAdmin
      .from('platform_profiles')
      .select('*')
      .limit(0) // Get schema without data
    
    // Attempting to use a raw query if possible, or just checking if a column exists by selecting it
    const { error: colCheckError } = await supabaseAdmin
      .from('platform_profiles')
      .select('audit_data')
      .limit(1)

    return NextResponse.json({
      has_audit_data: !colCheckError,
      profile_error: colCheckError ? colCheckError.message : "Column exists",
      raw_error: pError
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
