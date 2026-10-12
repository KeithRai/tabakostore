'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { getReceiptBadgeCount } from '@/app/orders/actions'
import { useCart } from './cart-provider'
import { useLang } from './lang-provider'
import LanguageSwitcher from './language-switcher'
import NavMenu from './nav-menu'

// 打开 Tidio 客服聊天窗口
export function openChat() {
  const w = window as unknown as {
    tidioChatApi?: { open?: () => void }
    Tidio?: (cmd: string, ...args: unknown[]) => unknown
  }
  // 通知页面：客服窗口已打开（清零未读角标）
  window.dispatchEvent(new Event('tidio:opened'))
  if (typeof w.tidioChatApi?.open === 'function') {
    w.tidioChatApi.open()
  } else if (typeof w.Tidio === 'function') {
    try {
      w.Tidio('show')
    } catch {
      alert('Customer service chat is still loading, please try again in a moment.')
    }
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
  // 待确认收货的订单数量（导航栏订单图标角标）
  const [receiptCount, setReceiptCount] = useState(0)
  // 客服未读消息数量
  const [chatUnread, setChatUnread] = useState(0)
  const router = useRouter()
  const { count } = useCart()
  const { t } = useLang()

  // 待收货数量：登录后读取
  const loadReceiptCount = useCallback(async (loggedIn: boolean) => {
    if (!loggedIn) {
      setReceiptCount(0)
      return
    }
    try {
      const n = await getReceiptBadgeCount()
      setReceiptCount(n)
    } catch {
      setReceiptCount(0)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user
      setUser(u ? (u as unknown as NavUser) : null)
      setLoading(false)
      loadReceiptCount(!!u)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      setUser(u ? (u as unknown as NavUser) : null)
      setLoading(false)
      loadReceiptCount(!!u)
    })
    return () => subscription.unsubscribe()
  }, [loadReceiptCount])

  // 客服未读消息：尝试监听 Tidio 提供的未读事件
  useEffect(() => {
    const w = window as unknown as {
      Tidio?: (cmd: string, ...args: unknown[]) => unknown
    }
    if (typeof w.Tidio !== 'function') return

    // 打开聊天窗口时清零
    const onOpen = () => setChatUnread(0)
    window.addEventListener('tidio:opened', onOpen)

    try {
      // 不同版本事件名不同，逐个尝试，失败则忽略
      const setUnread = (value: unknown) => {
        const n = Number(value)
        if (!isNaN(n) && n >= 0) setChatUnread(n)
      }
      w.Tidio('on', 'unreadMessagesChanged', setUnread)
      w.Tidio('on', 'unreadMessagesCountChanged', setUnread)
      w.Tidio('on', 'messageReceived', () =>
        setChatUnread((n) => n + 1)
      )
    } catch {
      // Tidio 不支持这些事件：不显示角标（不影响聊天功能）
    }

    return () => {
      window.removeEventListener('tidio:opened', onOpen)
    }
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
        {/* 我的订单图标（含"待确认收货"数量角标，在购物车和客服之间） */}
        <Link
          href="/orders"
          className="cart-btn"
          aria-label={t('myOrders')}
        >
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
            <rect
              width="8"
              height="4"
              x="8"
              y="2"
              rx="1"
              ry="1"
            />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4" />
            <path d="M12 16h4" />
            <path d="M8 11h.01" />
            <path d="M8 16h.01" />
          </svg>
          {receiptCount > 0 ? (
            <span className="cart-badge">{receiptCount}</span>
          ) : null}
        </Link>
        {/* 联系客服：仅图标（含未读消息角标） */}
        <button
          type="button"
          className="cart-btn"
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
          {chatUnread > 0 ? (
            <span className="cart-badge">{chatUnread}</span>
          ) : null}
        </button>
        {/* 用户头像（在 menu 和 language 之间） */}
        <Link
          href={user ? '/profile' : '/login'}
          className="avatar-btn"
          aria-label={t('profile')}
        >
          {user?.user_metadata?.avatar_url ? (
            <Image
              className="avatar-img"
              src={String(user.user_metadata.avatar_url)}
              alt=""
              width={32}
              height={32}
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
