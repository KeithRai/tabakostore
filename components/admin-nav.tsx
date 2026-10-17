'use client'

import Link from 'next/link'
import { useLang } from './lang-provider'

// 后台导航：商品管理 / 订单管理 / 新闻管理 / 费用设置 / 帮助信息编辑
// 语言切换使用页面顶部导航栏的地球图标（整站统一）
export default function AdminNav({
  active,
}: {
  active:
    | 'dashboard'
    | 'products'
    | 'orders'
    | 'news'
    | 'fees'
    | 'instructions'
}) {
  const { t } = useLang()

  const items: Array<{
    key:
      | 'dashboard'
      | 'products'
      | 'orders'
      | 'news'
      | 'fees'
      | 'instructions'
    href: string
    label: string
  }> = [
    { key: 'dashboard', href: '/admin/dashboard', label: t('admDashboard') },
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
    </div>
  )
}
