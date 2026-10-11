'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '../actions'
import { ORDER_STATUS_ZH } from '@/lib/format'
import { useCurrency } from '@/components/currency-provider'
import type { Order } from '@/lib/types'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

// 把订单按日期分组（YYYY-MM-DD）
function groupByDate(orders: Order[]): Map<string, Order[]> {
  const map = new Map<string, Order[]>()
  for (const o of orders) {
    const d = new Date(o.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const arr = map.get(key) ?? []
    arr.push(o)
    map.set(key, arr)
  }
  return map
}

// 订单管理：按日期筛选、查看订单详情、修改订单状态
export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const { cny, jpy } = useCurrency()
  // 选中的日期（null = 全部）
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 按日期分组（新订单在前）
  const dateMap = useMemo(() => groupByDate(orders), [orders])
  const dates = Array.from(dateMap.keys()).sort().reverse()
  const shownOrders = selectedDate
    ? (dateMap.get(selectedDate) ?? [])
    : orders

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

      {/* 按日期筛选：点击某一天查看当天订单 */}
      {dates.length > 0 && (
        <div className="date-filter">
          <button
            type="button"
            className={`btn btn-sm ${selectedDate === null ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedDate(null)}
          >
            全部（{orders.length}）
          </button>
          {dates.map((d) => (
            <button
              key={d}
              type="button"
              className={`btn btn-sm ${selectedDate === d ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedDate(d)}
            >
              {d}（{dateMap.get(d)?.length ?? 0}）
            </button>
          ))}
        </div>
      )}

      {shownOrders.length === 0 ? (
        <div className="empty">
          <p>暂无订单</p>
        </div>
      ) : (
        shownOrders.map((order) => (
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
              地址：{order.city ? `${order.city}, ` : ''}
              {order.address}
              {order.phone ? ` · 电话：${order.phone}` : ''}
            </div>
            <div className="order-items">
              {order.order_items.map((item) => (
                <div key={item.id}>
                  {item.product_name} × {item.quantity} —{' '}
                  {cny(parseFloat(item.price))} /{' '}
                  {jpy(parseFloat(item.price))}
                </div>
              ))}
            </div>
            <div className="cart-total">
              <span>订单金额：</span>
              <strong>
                {cny(parseFloat(order.total))} /{' '}
                {jpy(parseFloat(order.total))}
              </strong>
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
