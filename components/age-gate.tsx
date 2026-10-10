'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLang } from './lang-provider'

// 全站年龄验证：首次访问显示欢迎页，确认满 18 岁后才能进入
export default function AgeGate() {
  const { t } = useLang()
  const pathname = usePathname()
  const [verified, setVerified] = useState(false)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    const cookies = document.cookie
      .split(';')
      .map((c) => c.trim())
    if (cookies.some((c) => c.startsWith('age_verified='))) {
      setVerified(true)
    }
  }, [])

  // 管理后台不显示年龄验证
  if (verified || denied || pathname.startsWith('/admin')) {
    return null
  }

  return (
    <div className="age-gate">
      <div className="age-card">
        <h1>{t('welcomeTitle')}</h1>
        <p>{t('ageQuestion')}</p>
        <div className="age-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              document.cookie =
                'age_verified=1; path=/; max-age=31536000; samesite=lax'
              setVerified(true)
            }}
          >
            {t('ageYes')}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setDenied(true)}
          >
            {t('ageNo')}
          </button>
        </div>
        {denied ? <p className="age-deny">{t('ageDeny')}</p> : null}
      </div>
    </div>
  )
}
