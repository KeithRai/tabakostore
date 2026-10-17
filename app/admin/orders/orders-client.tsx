'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '../actions'
import { orderStatusLabel } from '@/lib/format'
import { useLang } from '@/components/lang-provider'
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
  const { lang, t } = useLang()
  const { cny, jpy } = useCurrency()
  // 状态筛选（全部 / 待支付 / 待发货）
  const [filter, setFilter] = useState<Filter>('all')
  // 选中的日期（空 = 全部日期）
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
      setMsg(t('admMovedToShip', { no: orderNo }))
    } else if (status === 'pending') {
      setMsg(t('admMovedToPending', { no: orderNo }))
    } else {
      setMsg(t('admStatusUpdated', { no: orderNo }))
    }
    router.refresh()
  }

  const hasFilter = filter !== 'all' || Boolean(selectedDate)

  return (
    <div>
      <h1>{t('admOrderMgmt')}</h1>
      <p className="muted">{t('admOrderDesc')}</p>

      {/* 筛选栏：状态按钮 + 日期下拉 */}
      <div className="filter-bar">
        <button
          type="button"
          className={`btn btn-sm filter-btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >
          {t('admAll')}（{orders.length}）
        </button>
        <button
          type="button"
          className={`btn btn-sm filter-btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('pending')}
        >
          {t('admPendingPay')}
          {pendingCount > 0 ? (
            <span className="filter-badge">{pendingCount}</span>
          ) : null}
        </button>
        <button
          type="button"
          className={`btn btn-sm filter-btn ${filter === 'paid' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('paid')}
        >
          {t('admToShip')}
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
          <option value="">{t('admAllDates')}</option>
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
            {t('admClearFilter')}
          </button>
        ) : null}
      </div>

      {msg ? <p className="muted">{msg}</p> : null}

      {shownOrders.length === 0 ? (
        <div className="empty">
          <p>{t('admNoMatchOrders')}</p>
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
                {orderStatusLabel(order.status, lang)}
              </span>
            </div>
            <div className="muted">
              {t('admCustomer')}: {order.full_name} · {order.email} ·{' '}
              {order.country}
            </div>
            <div className="muted">
              {t('admAddress')}: {order.city ? `${order.city}, ` : ''}
              {order.address}
              {order.phone ? ` · ${order.phone}` : ''}
            </div>
            <div className="order-items">
              {order.order_items.map((item) => (
                <div key={item.id}>
                  {item.product_name} × {item.quantity}
                  {item.variant ? (
                    <span className="muted"> （{item.variant}）</span>
                  ) : null}{' '}
                  — {cny(parseFloat(item.price))} /{' '}
                  {jpy(parseFloat(item.price))}
                </div>
              ))}
            </div>
            <div className="cart-total">
              <span>{t('admOrderAmount')}:</span>
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
                    {orderStatusLabel(s, lang)}
                  </option>
                ))}
              </select>
              <span className="muted">{t('admAutoSaveStatus')}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
