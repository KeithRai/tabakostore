'use client'

import { useEffect, useRef, useState } from 'react'
import { useLang } from './lang-provider'
import { LANG_LIST, LANG_LABELS, type Lang } from '@/lib/i18n'

// 语言切换下拉框：显示 Language，点开可选择 中/日/英
export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 点击外部自动收起
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="lang-dropdown" ref={ref}>
      <button
        type="button"
        className="lang-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        Language ▾
      </button>
      {open && (
        <div className="lang-menu">
          {LANG_LIST.map((l: Lang) => (
            <button
              key={l}
              type="button"
              className={lang === l ? 'active' : ''}
              onClick={() => {
                setLang(l)
                setOpen(false)
              }}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
