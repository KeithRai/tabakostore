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
      <Link href="/" className="logo">
        TabakoStore
      </Link>
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
        <Link href="/cart">
          {t('cart')}
          {count > 0 ? ` (${count})` : ''}
        </Link>
        <button type="button" className="link-btn" onClick={openChat}>
          {t('contactUs')}
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
            <span className="avatar-icon">👤</span>
          )}
        </Link>
        <LanguageSwitcher />
        <NavMenu user={user} loading={loading} onLogout={logout} />
      </nav>
    </header>
  )
}
