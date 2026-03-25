"use client"

import { LANGUAGES } from "@/lib/constants"

interface LanguageToggleProps {
  lang: string
  setLang: (lang: string) => void
}

export default function LanguageToggle({ lang, setLang }: LanguageToggleProps) {
  return (
    <div className="flex space-x-2 bg-slate-800 rounded px-2 py-1">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`text-sm px-2 py-1 rounded transition-colors ${
            lang === l.code ? "bg-slate-600 text-white font-medium" : "text-slate-400 hover:text-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
