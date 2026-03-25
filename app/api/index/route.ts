import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("platform, deficit")
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) throw error

    const platformStats: Record<string, { totalDeficit: number; count: number }> = {}

    data.forEach((row: any) => {
      if (!platformStats[row.platform]) {
        platformStats[row.platform] = { totalDeficit: 0, count: 0 }
      }
      platformStats[row.platform].totalDeficit += row.deficit
      platformStats[row.platform].count += 1
    })

    const index = Object.entries(platformStats)
      .map(([platform, stats]) => ({
        platform,
        avgDeficit: Math.round(stats.totalDeficit / stats.count),
        workerCount: stats.count,
        exploitationScore: Math.min(100, Math.round((stats.totalDeficit / stats.count / 19285) * 100)),
      }))
      .sort((a, b) => b.exploitationScore - a.exploitationScore)

    return NextResponse.json({ success: true, index })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch index" }, { status: 500 })
  }
}
