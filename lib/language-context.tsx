"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Language } from "./types"

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (uz: string, ru: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("uz")

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language
    if (saved) setLang(saved)
  }, [])

  const handleSetLang = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem("lang", newLang)
  }

  const t = (uz: string, ru: string) => (lang === "uz" ? uz : ru)

  return <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within LanguageProvider")
  return context
}
