'use client'

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { getDictionary, type Dict, type Lang } from '@/lib/i18n'

type LangContextType = {
  lang: Lang
  t: (key: keyof Dict, params?: Record<string, string | number>) => string
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextType | null>(null)

// 语言切换：写入 lang cookie 并刷新服务端组件
export function LangProvider({
  lang,
  children,
}: {
  lang: Lang
  children: ReactNode
}) {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<Lang>(lang)

  const t: LangContextType['t'] = (key, params) => {
    let s = getDictionary(currentLang)[key] as string
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        s = s.replace(`{${k}}`, String(v))
      }
    }
    return s
  }

  const setLang = (newLang: Lang) => {
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; samesite=lax`
    setCurrentLang(newLang)
    router.refresh()
  }

  return (
    <LangContext.Provider value={{ lang: currentLang, t, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextType {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
