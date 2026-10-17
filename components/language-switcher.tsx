'use client'

import { useEffect, useRef, useState } from 'react'
import { useLang } from './lang-provider'
import { LANG_LIST, LANG_LABELS, type Lang } from '@/lib/i18n'

// 语言切换：地球图标按钮，点开可选择 中文 / English / 繁體 / 日本語
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
        className="lang-toggle lang-toggle-icon"
        onClick={() => setOpen((v) => !v)}
        aria-label={LANG_LABELS[lang]}
        title={LANG_LABELS[lang]}
      >
        {/* 地球图标 */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
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
