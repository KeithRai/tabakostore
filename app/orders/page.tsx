import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import {
  getRates,
  formatCNY,
  formatJPY,
} from '@/lib/currency'
import { orderStatusLabel } from '@/lib/format'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import { cleanupExpiredOrders } from '@/lib/order-utils'
import { buildMetadata } from '@/lib/seo'
import CancelOrderButton from '@/components/cancel-order-button'
import type { Order } from '@/lib/types'

// SEO
export function generateMetadata() {
  return buildMetadata('myOrders')
}

export default async function OrdersPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  // 清理超过 24 小时未付款的待支付订单
  await cleanupExpiredOrders()

  // 实时汇率
  const rates = await getRates()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/orders')

  const db = createServiceClient()
  const { data } = await db
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  const orders = (data ?? []) as Order[]

  return (
    <div>
      <h1>{tr(dict, 'myOrders')}</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        {tr(dict, 'pendingExpireNote')}
      </p>
      {orders.length === 0 ? (
        <div className="empty">
          <p>{tr(dict, 'noOrders')}</p>
          <Link className="btn btn-primary" href="/">
            {tr(dict, 'startShopping')}
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-head">
              <Link href={`/orders/${order.id}`}>
                {order.order_no}
              </Link>
              <span className={`status-pill ${order.status}`}>
                {orderStatusLabel(order.status, lang)}
              </span>
            </div>
            <div className="muted">
              {new Date(order.created_at).toLocaleString()} ·{' '}
              {tr(dict, 'shipTo')}: {order.full_name},{' '}
              {order.city ? `${order.city}, ` : ''}
              {order.country}
            </div>
            <div className="order-items">
              {order.order_items.map((item) => (
                <div key={item.id}>
                  {item.product_name} × {item.quantity} —{' '}
                  {formatCNY(parseFloat(item.price), rates)} /{' '}
                  {formatJPY(parseFloat(item.price), rates)}
                </div>
              ))}
            </div>
            <div className="cart-total">
              <span>{tr(dict, 'total')}:</span>
              <strong>
                {formatCNY(parseFloat(order.total), rates)} /{' '}
                {formatJPY(parseFloat(order.total), rates)}
              </strong>
            </div>
            {order.status === 'pending' ? (
              <p className="muted">{tr(dict, 'pendingNote')}</p>
            ) : null}
            {order.status === 'pending' ? (
              <div style={{ marginTop: 10 }}>
                <CancelOrderButton orderId={order.id} />
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  )
}
