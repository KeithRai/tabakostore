import Link from 'next/link'

// 后台导航：商品管理 / 订单管理 / 新闻管理 / 说明
export default function AdminNav({
  active,
}: {
  active: 'products' | 'orders' | 'news' | 'instructions'
}) {
  return (
    <div className="admin-nav">
      <Link
        href="/admin/products"
        className={active === 'products' ? 'active' : ''}
      >
        商品管理
      </Link>
      <Link
        href="/admin/orders"
        className={active === 'orders' ? 'active' : ''}
      >
        订单管理
      </Link>
      <Link
        href="/admin/news"
        className={active === 'news' ? 'active' : ''}
      >
        新闻管理
      </Link>
      <Link
        href="/admin/instructions"
        className={active === 'instructions' ? 'active' : ''}
      >
        说明
      </Link>
    </div>
  )
}
