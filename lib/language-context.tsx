"use client"

import React, { createContext, useContext, useState } from "react"

type LanguageContextType = {
  language: string
  setLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === "undefined") return "en"
    return localStorage.getItem("gigshield-lang") || "en"
  })
  const [mounted] = useState(typeof window !== "undefined")

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    localStorage.setItem("gigshield-lang", lang)
  }

  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: "en", setLanguage }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
