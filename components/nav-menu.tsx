'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLang } from './lang-provider'

// 汉堡菜单：主页 → 登录/注册 → 商品/种类/搜索/新闻/帮助
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

  // 跳转后自动收起菜单
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const close = () => setOpen(false)

  return (
    <div className="menu-wrap">
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
            🏠 {t('home')}
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
              1. {t('products')}
            </Link>
            <Link href="/categories" onClick={close}>
              2. {t('categories')}
            </Link>
            <Link href="/search" onClick={close}>
              3. {t('search')}
            </Link>
            <Link href="/news" onClick={close}>
              4. {t('news')}
            </Link>
            <Link href="/help" onClick={close}>
              5. {t('help')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
