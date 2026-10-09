'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useCart } from './cart-provider'
import { useLang } from './lang-provider'
import { LANG_LIST, LANG_LABELS, type Lang } from '@/lib/i18n'

// 打开 Tidio 客服聊天窗口
export function openChat() {
  const w = window as unknown as { tidioChatApi?: { open?: () => void } }
  if (typeof w.tidioChatApi?.open === 'function') {
    w.tidioChatApi.open()
  } else {
    alert('Customer service chat is still loading, please try again in a moment.')
  }
}

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { count } = useCart()
  const { t, lang, setLang } = useLang()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
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
        <Link href="/">{t('shop')}</Link>
        <Link href="/cart">
          {t('cart')}
          {count > 0 ? ` (${count})` : ''}
        </Link>
        <button type="button" className="link-btn" onClick={openChat}>
          {t('contactUs')}
        </button>
        {/* 管理后台保持中文，不显示语言切换 */}
        {!isAdmin && (
          <div className="lang-switch">
            {LANG_LIST.map((l: Lang) => (
              <button
                key={l}
                type="button"
                className={`lang-btn${lang === l ? ' active' : ''}`}
                onClick={() => setLang(l)}
                disabled={lang === l}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        )}
        {loading ? null : user ? (
          <>
            <Link href="/orders">{t('myOrders')}</Link>
            <span className="nav-email">{user.email}</span>
            <button type="button" className="link-btn" onClick={logout}>
              {t('logOut')}
            </button>
          </>
        ) : (
          <>
            <Link href="/login">{t('logIn')}</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              {t('signUp')}
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
