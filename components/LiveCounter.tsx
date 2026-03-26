"use client"

import { useEffect, useState } from "react"

interface LiveCounterProps {
  label: string
  suffix?: string
}

export default function LiveCounter({ label, suffix = "" }: LiveCounterProps) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/exploitation")
        const json = await res.json()
        if (json.index) {
          const total = json.index.reduce((acc: number, item: any) => acc + item.workerCount, 0)
          setCount(total)
        }
      } catch {
        setCount(0)
      }
    }
    fetchCount()
  }, [])

  // Animated counting effect
  const [displayCount, setDisplayCount] = useState(0)
  useEffect(() => {
    if (count === null) return
    const duration = 1500 // ms
    const steps = 40
    const increment = count / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= count) {
        setDisplayCount(count)
        clearInterval(timer)
      } else {
        setDisplayCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [count])

  return (
    <div className="bg-[#1c1b1b] rounded-[24px] p-6 md:p-8 border border-neutral-800/50 hover:bg-[#201f1f] transition-colors cursor-default">
      <h2 className="text-4xl md:text-5xl font-black text-[#3ce36a] tracking-tighter mb-2">
        {count === null ? (
          <span className="inline-block w-20 h-10 bg-neutral-800 rounded animate-pulse" />
        ) : (
          <>{displayCount.toLocaleString("en-IN")}{suffix}</>
        )}
      </h2>
      <p className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">{label}</p>
    </div>
  )
}
