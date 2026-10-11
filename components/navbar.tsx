'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useCart } from './cart-provider'
import { useLang } from './lang-provider'
import LanguageSwitcher from './language-switcher'
import NavMenu from './nav-menu'

// 打开 Tidio 客服聊天窗口
export function openChat() {
  const w = window as unknown as { tidioChatApi?: { open?: () => void } }
  if (typeof w.tidioChatApi?.open === 'function') {
    w.tidioChatApi.open()
  } else {
    alert('Customer service chat is still loading, please try again in a moment.')
  }
}

type NavUser = {
  email?: string
  user_metadata?: { avatar_url?: string } | null
}

export default function Navbar() {
  const [user, setUser] = useState<NavUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { count } = useCart()
  const { t } = useLang()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user
      setUser(u ? (u as unknown as NavUser) : null)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      setUser(u ? (u as unknown as NavUser) : null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/" className="logo">
          TabakoStore
        </Link>
        {/* 小房子图标：返回主页 */}
        <Link href="/" className="icon-btn" aria-label={t('home')}>
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
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>
      </div>
      <nav className="nav-links">
        {/* 搜索图标（在购物车左边） */}
        <Link href="/search" className="icon-btn" aria-label={t('search')}>
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </Link>
        {/* 购物袋图标（含数量角标） */}
        <Link href="/cart" className="cart-btn" aria-label={t('cart')}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {count > 0 ? <span className="cart-badge">{count}</span> : null}
        </Link>
        {/* 联系客服：仅图标 */}
        <button
          type="button"
          className="icon-btn"
          onClick={openChat}
          aria-label={t('contactUs')}
        >
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
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
        </button>
        {/* 用户头像（在 menu 和 language 之间） */}
        <Link
          href={user ? '/profile' : '/login'}
          className="avatar-btn"
          aria-label={t('profile')}
        >
          {user?.user_metadata?.avatar_url ? (
            <img
              className="avatar-img"
              src={user.user_metadata.avatar_url}
              alt=""
            />
          ) : (
            <span className="avatar-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
          )}
        </Link>
        <LanguageSwitcher />
        <NavMenu user={user} loading={loading} onLogout={logout} />
      </nav>
    </header>
  )
}
