import Link from 'next/link'

// 后台导航：商品管理 / 订单管理 / 新闻管理 / 费用设置 / 帮助信息编辑
export default function AdminNav({
  active,
}: {
  active: 'products' | 'orders' | 'news' | 'fees' | 'instructions'
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
        href="/admin/fees"
        className={active === 'fees' ? 'active' : ''}
      >
        费用设置
      </Link>
      <Link
        href="/admin/instructions"
        className={active === 'instructions' ? 'active' : ''}
      >
        帮助信息编辑
      </Link>
    </div>
  )
}
