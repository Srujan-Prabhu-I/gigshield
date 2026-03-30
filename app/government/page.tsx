"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function GovernmentRouteRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/govt")
  }, [router])

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex items-center justify-center">
      <p>Redirecting to government dashboard...</p>
    </div>
  )
}
