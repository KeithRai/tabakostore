'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '../actions'
import { ORDER_STATUS_ZH } from '@/lib/format'
import { useCurrency } from '@/components/currency-provider'
import type { Order } from '@/lib/types'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

// 订单筛选：全部 / 待支付 / 待发货（配合日期下拉）
type Filter = 'all' | 'pending' | 'paid'

// 日期键（YYYY-MM-DD）
function dateKey(createdAt: string): string {
  const d = new Date(createdAt)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 订单管理：按状态和日期筛选、修改订单状态
export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const { cny, jpy } = useCurrency()
  // 状态筛选（全部 / 待支付 / 待发货）
  const [filter, setFilter] = useState<Filter>('all')
  // 选中的日期（null = 全部日期）
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [msg, setMsg] = useState('')

  // 待支付 / 待发货 数量（按钮角标）
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const paidCount = orders.filter((o) => o.status === 'paid').length

  // 可选日期（新日期在前），带当天订单数
  const dateOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const o of orders) {
      const k = dateKey(o.created_at)
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }
    return Array.from(counts.keys())
      .sort()
      .reverse()
      .map((d) => ({ date: d, count: counts.get(d) ?? 0 }))
  }, [orders])

  // 当前显示的订单（状态 + 日期同时生效）
  const shownOrders = useMemo(() => {
    let list = orders
    if (filter === 'pending') {
      list = list.filter((o) => o.status === 'pending')
    } else if (filter === 'paid') {
      list = list.filter((o) => o.status === 'paid')
    }
    if (selectedDate) {
      list = list.filter((o) => dateKey(o.created_at) === selectedDate)
    }
    return list
  }, [orders, filter, selectedDate])

  async function onChange(id: string, status: string, orderNo: string) {
    const res = await updateOrderStatus(id, status)
    if (res?.error) {
      alert(res.error)
      return
    }
    // 标记为已支付时提示已进入待发货列表
    if (status === 'paid') {
      setMsg(`✅ 订单 ${orderNo} 已移入"待发货"列表`)
    } else if (status === 'pending') {
      setMsg(`✅ 订单 ${orderNo} 已移回"待支付"列表`)
    } else {
      setMsg(`✅ 订单 ${orderNo} 状态已更新`)
    }
    router.refresh()
  }

  const hasFilter = filter !== 'all' || Boolean(selectedDate)

  return (
    <div>
      <h1>订单管理</h1>
      <p className="muted">
        用户下单后订单会出现在这里，状态为"待支付"。用户在客服聊天中完成
        微信/支付宝付款后，请把状态改为"已支付"，订单会进入"待发货"列表，
        然后安排发货。
      </p>

      {/* 筛选栏：状态按钮 + 日期下拉 */}
      <div className="filter-bar">
        <button
          type="button"
          className={`btn btn-sm filter-btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >
          全部（{orders.length}）
        </button>
        <button
          type="button"
          className={`btn btn-sm filter-btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('pending')}
        >
          待支付
          {pendingCount > 0 ? (
            <span className="filter-badge">{pendingCount}</span>
          ) : null}
        </button>
        <button
          type="button"
          className={`btn btn-sm filter-btn ${filter === 'paid' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('paid')}
        >
          待发货
          {paidCount > 0 ? (
            <span className="filter-badge">{paidCount}</span>
          ) : null}
        </button>

        {/* 日期下拉选择 */}
        <select
          className="input date-select"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="">全部日期</option>
          {dateOptions.map((d) => (
            <option key={d.date} value={d.date}>
              {d.date}（{d.count}）
            </option>
          ))}
        </select>

        {hasFilter ? (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setFilter('all')
              setSelectedDate('')
            }}
          >
            清除筛选
          </button>
        ) : null}
      </div>

      {msg ? <p className="muted">{msg}</p> : null}

      {shownOrders.length === 0 ? (
        <div className="empty">
          <p>没有符合条件的订单</p>
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
                onChange={(e) =>
                  onChange(order.id, e.target.value, order.order_no)
                }
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
