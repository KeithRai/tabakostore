import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { getRates, formatCNY, formatJPY } from '@/lib/currency'
import { orderStatusLabel } from '@/lib/format'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import { buildMetadata } from '@/lib/seo'
import CancelOrderButton from '@/components/cancel-order-button'
import ConfirmReceiptButton from '@/components/confirm-receipt-button'
import { autoConfirmReceipts } from '@/lib/order-utils'
import type { Order } from '@/lib/types'

// SEO
export function generateMetadata() {
  return buildMetadata('orderDetails')
}

// 订单详情页（需登录，且订单属于当前用户）
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/orders/' + id)

  // 发货超过 14 天未确认收货的订单自动确认
  await autoConfirmReceipts()

  // 订单 + 商品明细（仅限本人的订单）
  const db = createServiceClient()
  const { data } = await db
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (!data) notFound()
  const order = data as Order

  const rates = await getRates()

  return (
    <div>
      <Link
        className="muted"
        href="/orders"
        style={{ display: 'inline-block', marginBottom: 12 }}
      >
        ← {tr(dict, 'myOrders')}
      </Link>
      <h1>{tr(dict, 'orderDetails')}</h1>
      <div className="order-card">
        <div className="order-head">
          <strong>{order.order_no}</strong>
          <span className={`status-pill ${order.status}`}>
            {orderStatusLabel(order.status, lang)}
          </span>
        </div>
        <div className="muted">
          {tr(dict, 'orderDate')}:{' '}
          {new Date(order.created_at).toLocaleString()}
        </div>

        <h3>{tr(dict, 'shipTo')}</h3>
        <p>
          {order.full_name}
          <br />
          {order.country}
          {order.city ? `, ${order.city}` : ''}
          <br />
          {order.address}
          {order.phone ? <br /> : null}
          {order.phone ?? ''}
        </p>

        <h3>{tr(dict, 'product')}</h3>
        <div className="order-items">
          {order.order_items.map((item) => (
            <div className="cell-product" key={item.id}>
              {item.image_url ? (
                <Image
                  className="cell-img"
                  src={item.image_url}
                  alt=""
                  width={48}
                  height={48}
                />
              ) : null}
              <span>
                {item.product_name} × {item.quantity}
                {item.variant ? (
                  <span className="muted"> （{item.variant}）</span>
                ) : null}{' '}
                — {formatCNY(parseFloat(item.price), rates)} /{' '}
                {formatJPY(parseFloat(item.price), rates)}
              </span>
            </div>
          ))}
        </div>

        <div className="cart-total">
          <span>{tr(dict, 'totalExclShipping')}:</span>
          <strong>
            {formatCNY(parseFloat(order.total), rates)} /{' '}
            {formatJPY(parseFloat(order.total), rates)}
          </strong>
        </div>
        <p className="muted">{tr(dict, 'shippingNote')}</p>

        {order.status === 'pending' ? (
          <div style={{ marginTop: 10 }}>
            <CancelOrderButton orderId={order.id} />
          </div>
        ) : null}
        {/* 已发货：确认收货 + 14 天自动确认说明 */}
        {order.status === 'shipped' ? (
          <>
            <ConfirmReceiptButton orderId={order.id} />
            <p className="muted">{tr(dict, 'receiptAutoNote')}</p>
          </>
        ) : null}
      </div>
    </div>
  )
}
