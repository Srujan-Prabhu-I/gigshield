"use client"

import Link from "next/link"
import { useState } from "react"
import { LANGUAGES } from "@/lib/constants"
import LanguageToggle from "./LanguageToggle"

export default function Navbar() {
  const [lang, setLang] = useState("en")

  return (
    <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">GigShield</Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/checker" className="hover:text-slate-300">Check My Pay</Link>
          <Link href="/index" className="hover:text-slate-300">Exploitation Index</Link>
          <Link href="/dashboard" className="hover:text-slate-300">Dashboard</Link>
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
        {/* Mobile menu toggle goes here */}
        <div className="md:hidden">
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
      </div>
    </nav>
  )
}
