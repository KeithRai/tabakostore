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

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { count } = useCart()
  const { t } = useLang()

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
        <Link href="/cart">
          {t('cart')}
          {count > 0 ? ` (${count})` : ''}
        </Link>
        <button type="button" className="link-btn" onClick={openChat}>
          {t('contactUs')}
        </button>
        <LanguageSwitcher />
        <NavMenu user={user} loading={loading} onLogout={logout} />
      </nav>
    </header>
  )
}
