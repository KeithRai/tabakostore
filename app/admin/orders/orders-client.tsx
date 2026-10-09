'use client'

import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '../actions'
import { usd, ORDER_STATUS_ZH } from '@/lib/format'
import type { Order } from '@/lib/types'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

// 订单管理：查看订单详情、修改订单状态
export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter()

  async function onChange(id: string, status: string) {
    const res = await updateOrderStatus(id, status)
    if (res?.error) {
      alert(res.error)
    }
    router.refresh()
  }

  return (
    <div>
      <h1>订单管理</h1>
      <p className="muted">
        用户下单后订单会出现在这里，状态为"待支付"。用户在客服聊天中完成
        微信/支付宝付款后，请把状态改为"已支付"，然后安排发货。
      </p>
      {orders.length === 0 ? (
        <div className="empty">
          <p>暂无订单</p>
        </div>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-head">
              <div>
                <strong>{order.order_no}</strong>
                <div className="muted">
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
              <span className={`status-pill ${order.status}`}>
                {ORDER_STATUS_ZH[order.status] ?? order.status}
              </span>
            </div>
            <div className="muted">
              客户：{order.full_name} · {order.email} · {order.country}
            </div>
            <div className="muted">
              地址：{order.address}
              {order.phone ? ` · 电话：${order.phone}` : ''}
            </div>
            <div className="order-items">
              {order.order_items.map((item) => (
                <div key={item.id}>
                  {item.product_name} × {item.quantity} —{' '}
                  {usd(item.price)}
                </div>
              ))}
            </div>
            <div className="cart-total">
              <span>订单金额：</span>
              <strong>{usd(order.total)}</strong>
            </div>
            <div className="status-form">
              <select
                defaultValue={order.status}
                onChange={(e) => onChange(order.id, e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_ZH[s]}
                  </option>
                ))}
              </select>
              <span className="muted">（选择后自动保存）</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
