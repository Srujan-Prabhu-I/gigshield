"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calculator, BarChart3, LayoutGrid } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Checker", href: "/checker", icon: Calculator },
    { name: "Rights", href: "/worker-rights", icon: BarChart3 },
    { name: "Impact", href: "/impact", icon: LayoutGrid },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e0e0e]/90 backdrop-blur-xl border-t border-neutral-800/80 safe-area-pb md:hidden">
      <nav className="flex items-center justify-around h-[88px] pb-4 pt-2 max-w-md mx-auto px-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all duration-300 ${
                isActive ? "text-[#3fe56c] scale-105" : "text-neutral-500 hover:text-neutral-300 hover:scale-105"
              }`}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                  isActive ? "bg-[#3fe56c]/10 shadow-[0_0_20px_rgba(63,229,108,0.3)] border border-[#3fe56c]/20" : "bg-transparent border border-transparent"
                }`}
              >
                <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 ${isActive ? 'text-[#3fe56c]' : 'text-neutral-500'}`}>
                {tab.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
