"use client"

import Link from "next/link"
import WorkerCheckerPage from "@/app/worker/checker/page"
import { Card, CardContent } from "@/components/ui/card"

export default function CheckerPublicPage() {
  return (
    <>
      <WorkerCheckerPage />
      <div className="max-w-xl mx-auto px-4 pb-24 -mt-4">
        <Card className="bg-[#151515] border-neutral-800">
          <CardContent className="p-4 text-sm">
            <p className="text-neutral-200 font-semibold">Login for full access</p>
            <p className="text-neutral-400 mt-1">Workers: Login to track your history.</p>
            <p className="text-neutral-400">Platforms: Login to see your ranking.</p>
            <Link href="/login" className="inline-block mt-3 text-[#3fe56c] font-bold">
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

