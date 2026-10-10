'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLang } from './lang-provider'

// 全站年龄验证欢迎页：
// - 每次刷新页面都会显示
// - 点"我未满18岁"不能进入网站
// - 管理后台不显示
export default function AgeGate() {
  const { t } = useLang()
  const pathname = usePathname()
  const [denied, setDenied] = useState(false)
  const [passed, setPassed] = useState(false)

  // 管理后台不显示年龄验证
  if (pathname.startsWith('/admin')) {
    return null
  }

  // 已通过才进入网站
  if (!passed) {
    return (
      <div className="age-gate">
        <div className="age-card">
          <h1>{t('welcomeTitle')}</h1>
          <p>{t('ageQuestion')}</p>
          <div className="age-actions">
            <button
              className="btn btn-primary"
              onClick={() => setPassed(true)}
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
          {denied ? (
            <p className="age-deny">{t('ageDeny')}</p>
          ) : null}
        </div>
      </div>
    )
  }

  return null
}
