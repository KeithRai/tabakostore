'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from './cart-provider'
import { useLang } from './lang-provider'
import type { Dict } from '@/lib/i18n'

type Tab = {
  href: string
  labelKey: keyof Dict
  icon: 'home' | 'grid' | 'cart' | 'user' | 'heart'
}

const TABS: Tab[] = [
  { href: '/', labelKey: 'home', icon: 'home' },
  { href: '/categories', labelKey: 'categories', icon: 'grid' },
  { href: '/cart', labelKey: 'cart', icon: 'cart' },
  { href: '/wishlist', labelKey: 'wishlist', icon: 'heart' },
  { href: '/profile', labelKey: 'profile', icon: 'user' },
]

function Icon({ name }: { name: Tab['icon'] }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  if (name === 'home')
    return (
      <svg {...common}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  if (name === 'grid')
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  if (name === 'cart')
    return (
      <svg {...common}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    )
  if (name === 'heart')
    return (
      <svg {...common}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    )
  return (
    <svg {...common}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// 手机端底部快捷导航（桌面端隐藏）
export default function BottomNav() {
  const { t } = useLang()
  const { count } = useCart()
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return null

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const active =
          tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bottom-tab${active ? ' active' : ''}`}
          >
            <span className="bottom-icon">
              <Icon name={tab.icon} />
              {tab.icon === 'cart' && count > 0 ? (
                <span className="bottom-badge">{count}</span>
              ) : null}
            </span>
            <span className="bottom-label">{t(tab.labelKey)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
