import { cookies } from 'next/headers'
import AdminNav from '@/components/admin-nav'
import { requireAdmin } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase-service'
import { getRates, formatCNY, formatJPY } from '@/lib/currency'
import { orderStatusLabel } from '@/lib/format'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import { buildMetadata } from '@/lib/seo'

export function generateMetadata() {
  return buildMetadata('admDashboard')
}

// 后台数据看板：销售统计 + 热销商品 + 库存预警
export default async function AdminDashboardPage() {
  await requireAdmin()

  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  const db = createServiceClient()
  const [{ data: orders }, { data: items }, { data: products }] =
    await Promise.all([
      db
        .from('orders')
        .select('id, order_no, total, status, full_name, created_at')
        .order('created_at', { ascending: false }),
      db.from('order_items').select('product_id, product_name, quantity'),
      db
        .from('products')
        .select('id, name, stock, image_url')
        .order('stock', { ascending: true }),
    ])

  const rates = await getRates()
  const orderList = orders ?? []

  // 今日统计
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const todayOrders = orderList.filter(
    (o) => String(o.created_at ?? '').slice(0, 10) === todayKey
  )
  const sum = (list: typeof orderList) =>
    list.reduce((s, o) => s + parseFloat(String(o.total ?? '0')), 0)

  // 有效订单（排除已取消）
  const validOrders = orderList.filter((o) => o.status !== 'cancelled')
  const totalSales = sum(validOrders)
  const avgOrder =
    validOrders.length > 0 ? totalSales / validOrders.length : 0

  // 近 7 天销售额（从早到晚）
  const week: Array<{ label: string; value: number }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const dayOrders = validOrders.filter(
      (o) => String(o.created_at ?? '').slice(0, 10) === key
    )
    week.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      value: sum(dayOrders),
    })
  }
  const maxDay = Math.max(...week.map((w) => w.value), 1)

  // 热销商品（按销量）
  const soldMap = new Map<string, { name: string; qty: number }>()
  for (const it of items ?? []) {
    if (!it.product_id) continue
    const cur = soldMap.get(it.product_id) ?? {
      name: String(it.product_name ?? ''),
      qty: 0,
    }
    cur.qty += Number(it.quantity ?? 0)
    soldMap.set(it.product_id, cur)
  }
  const topProducts = Array.from(soldMap.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8)

  // 库存预警（库存 <= 5）
  const lowStock = (products ?? []).filter(
    (p) => (p.stock ?? 0) <= 5
  )

  const pendingPay = orderList.filter((o) => o.status === 'pending').length
  const toShip = orderList.filter((o) => o.status === 'paid').length
  const recent = orderList.slice(0, 5)

  return (
    <div>
      <AdminNav active="dashboard" />
      <h1>{tr(dict, 'admDashboard')}</h1>

      {/* 核心指标 */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="muted">{tr(dict, 'admTodaySales')}</div>
          <div className="stat-value">
            {formatCNY(sum(todayOrders), rates)}
          </div>
          <div className="muted">{formatJPY(sum(todayOrders), rates)}</div>
        </div>
        <div className="stat-card">
          <div className="muted">{tr(dict, 'admTodayOrders')}</div>
          <div className="stat-value">{todayOrders.length}</div>
          <div className="muted">
            {tr(dict, 'admPendingActions')}: {pendingPay}{' '}
            {tr(dict, 'admPendingPayCount')} · {toShip}{' '}
            {tr(dict, 'admToShipCount')}
          </div>
        </div>
        <div className="stat-card">
          <div className="muted">{tr(dict, 'admTotalSales')}</div>
          <div className="stat-value">
            {formatCNY(totalSales, rates)}
          </div>
          <div className="muted">{formatJPY(totalSales, rates)}</div>
        </div>
        <div className="stat-card">
          <div className="muted">{tr(dict, 'admTotalOrders')}</div>
          <div className="stat-value">{validOrders.length}</div>
          <div className="muted">
            {tr(dict, 'admAvgOrder')}: {formatCNY(avgOrder, rates)}
          </div>
        </div>
      </div>

      {/* 近 7 天销售额柱状图 */}
      <h2>{tr(dict, 'admLast7Days')}</h2>
      <div className="bar-chart">
        {week.map((w) => (
          <div className="bar-col" key={w.label}>
            <div className="bar-value">
              {w.value > 0
                ? formatCNY(w.value, rates).replace('¥', '')
                : '0'}
            </div>
            <div
              className="bar"
              style={{
                height: `${Math.max(
                  4,
                  Math.round((w.value / maxDay) * 100)
                )}%`,
              }}
            />
            <div className="bar-label">{w.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        {/* 热销商品 */}
        <div>
          <h2>{tr(dict, 'admTopProducts')}</h2>
          <div className="admin-panel">
            {topProducts.length === 0 ? (
              <p className="muted">{tr(dict, 'admNoSalesYet')}</p>
            ) : (
              topProducts.map((p, i) => (
                <div className="dash-row" key={p.id}>
                  <span className="dash-rank">{i + 1}</span>
                  <span className="dash-name">{p.name}</span>
                  <span className="muted">
                    × {p.qty}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 库存预警 */}
        <div>
          <h2>{tr(dict, 'admLowStock')}</h2>
          <div className="admin-panel">
            {lowStock.length === 0 ? (
              <p className="muted">{tr(dict, 'admNoLowStock')}</p>
            ) : (
              lowStock.slice(0, 10).map((p) => (
                <div className="dash-row" key={p.id}>
                  <span className="dash-name">{p.name}</span>
                  <span
                    className={
                      (p.stock ?? 0) === 0 ? 'stock stock-out' : 'stock'
                    }
                  >
                    {tr(dict, 'admStock')} {p.stock}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* 最新订单 */}
          <h2>{tr(dict, 'admRecentOrders')}</h2>
          <div className="admin-panel">
            {recent.length === 0 ? (
              <p className="muted">{tr(dict, 'admNoMatchOrders')}</p>
            ) : (
              recent.map((o) => (
                <div className="dash-row" key={o.id}>
                  <span className="dash-name">{o.order_no}</span>
                  <span className="muted">
                    {orderStatusLabel(String(o.status), lang)}
                  </span>
                  <span className="muted">
                    {formatCNY(parseFloat(String(o.total ?? '0')), rates)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
