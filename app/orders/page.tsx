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
import CancelOrderButton from '@/components/cancel-order-button'
import type { Order } from '@/lib/types'

export default async function OrdersPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

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
              <strong>{order.order_no}</strong>
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
