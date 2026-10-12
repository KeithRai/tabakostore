'use client'

import Link from 'next/link'
import LanguageSwitcher from './language-switcher'
import { useLang } from './lang-provider'

// 后台导航：商品管理 / 订单管理 / 新闻管理 / 费用设置 / 帮助信息编辑
// 右侧提供语言切换（切换后整站语言同步变化）
export default function AdminNav({
  active,
}: {
  active:
    | 'products'
    | 'orders'
    | 'news'
    | 'fees'
    | 'instructions'
}) {
  const { t } = useLang()

  const items: Array<{
    key: 'products' | 'orders' | 'news' | 'fees' | 'instructions'
    href: string
    label: string
  }> = [
    { key: 'products', href: '/admin/products', label: t('admProductMgmt') },
    { key: 'orders', href: '/admin/orders', label: t('admOrderMgmt') },
    { key: 'news', href: '/admin/news', label: t('admNewsMgmt') },
    { key: 'fees', href: '/admin/fees', label: t('admFees') },
    {
      key: 'instructions',
      href: '/admin/instructions',
      label: t('admInstructions'),
    },
  ]

  return (
    <div className="admin-nav">
      {items.map((it) => (
        <Link
          key={it.key}
          href={it.href}
          className={active === it.key ? 'active' : ''}
        >
          {it.label}
        </Link>
      ))}
      {/* 后台语言切换（中文 / English / 繁體 / 日本語） */}
      <span className="admin-lang">
        <LanguageSwitcher />
      </span>
    </div>
  )
}
