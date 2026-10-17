'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLang } from './lang-provider'

const AGE_OK_KEY = 'age_ok'

// 全站年龄验证欢迎页：
// - 每次打开网站（新的浏览器会话）显示一次
// - 通过后在本次浏览中不再重复弹出（搜索、切换页面不会再次出现）
// - 点"我未满18岁"不能进入网站
// - 管理后台不显示
export default function AgeGate() {
  const { t } = useLang()
  const pathname = usePathname()
  const [denied, setDenied] = useState(false)
  const [passed, setPassed] = useState(false)

  // 读取本次会话是否已通过验证
  useEffect(() => {
    try {
      if (sessionStorage.getItem(AGE_OK_KEY) === '1') {
        setPassed(true)
      }
    } catch {
      // 浏览器禁用存储时按未通过处理
    }
  }, [])

  function pass() {
    try {
      sessionStorage.setItem(AGE_OK_KEY, '1')
    } catch {
      // 存储失败不影响本次通过
    }
    setPassed(true)
  }

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
              onClick={pass}
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
