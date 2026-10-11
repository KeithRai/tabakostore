'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLang } from './lang-provider'

// 汉堡菜单：主页 → 登录/注册 → 商品/种类/搜索/新闻/帮助
// 点击菜单外区域自动关闭（与语言切换一致）
export default function NavMenu({
  user,
  loading,
  onLogout,
}: {
  user: { email?: string } | null
  loading: boolean
  onLogout: () => void
}) {
  const { t } = useLang()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 跳转后自动收起菜单
  useEffect(() => {
    setOpen(false)
  }, [pathname])

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

  const close = () => setOpen(false)

  return (
    <div className="menu-wrap" ref={ref}>
      <button
        type="button"
        className="menu-icon"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('menu')}
      >
        ☰
      </button>
      {open && (
        <div className="menu-panel">
          <Link href="/" className="menu-home" onClick={close}>
            {t('home')}
          </Link>

          {!loading && user ? (
            <>
              <div className="menu-email">{user.email}</div>
              <div className="menu-auth-row">
                <Link href="/orders" onClick={close}>
                  {t('myOrders')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    close()
                    onLogout()
                  }}
                >
                  {t('logOut')}
                </button>
              </div>
            </>
          ) : (
            <div className="menu-auth-row">
              <Link href="/login" onClick={close}>
                {t('logIn')}
              </Link>
              <Link href="/signup" onClick={close}>
                {t('signUp')}
              </Link>
            </div>
          )}

          <div className="menu-list">
            <Link href="/" onClick={close}>
              {t('products')}
            </Link>
            <Link href="/categories" onClick={close}>
              {t('categories')}
            </Link>
            <Link href="/search" onClick={close}>
              {t('search')}
            </Link>
            <Link href="/news" onClick={close}>
              {t('news')}
            </Link>
            <Link href="/help" onClick={close}>
              {t('help')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
