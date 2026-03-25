"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import LanguageToggle from "./LanguageToggle"

export default function Navbar() {
  const [lang, setLang] = useState("en")
  const pathname = usePathname()

  const navLinks = [
    { name: "Check My Pay", href: "/checker" },
    { name: "Exploitation Index", href: "/index" },
    { name: "Dashboard", href: "/dashboard" },
  ]

  return (
    <nav className="bg-[#0e0e0e]/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-16">
        <Link href="/" className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#3fe56c] to-[#00c853] flex items-center justify-center">
            <span className="text-black text-[10px] font-black">G</span>
          </div>
          GigShield
        </Link>
        <div className="hidden md:flex items-center space-x-1 h-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center h-full px-4 text-sm font-medium transition-colors relative ${
                  isActive ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {link.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3fe56c] shadow-[0_0_10px_rgba(63,229,108,0.5)]" />
                )}
              </Link>
            )
          })}
          <div className="pl-6 flex items-center h-full">
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
        </div>
        
        {/* Mobile menu toggle goes here */}
        <div className="md:hidden flex items-center">
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
      </div>
    </nav>
  )
}
