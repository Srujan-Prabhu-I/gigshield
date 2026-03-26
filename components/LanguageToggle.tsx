"use client"

import { LANGUAGES } from "@/lib/constants"
import { useLanguage } from "@/lib/language-context"

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex space-x-1 bg-[#131313] border border-neutral-800 rounded-full p-1 shadow-inner">
      {LANGUAGES.map((l) => {
        const isActive = language === l.code
        return (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all duration-300 ${
              isActive 
                ? "bg-[#3ce36a] text-[#002108] font-black shadow-[0_0_15px_rgba(60,227,106,0.2)]" 
                : "text-neutral-400 font-bold hover:text-white hover:bg-neutral-800"
            }`}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}
