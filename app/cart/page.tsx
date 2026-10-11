'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/cart-provider'
import { useLang } from '@/components/lang-provider'
import { useCurrency } from '@/components/currency-provider'
import { getFees } from '@/app/admin/actions'
import { DEFAULT_FEES } from '@/lib/constants'
import { MAX_ORDER } from '@/lib/constants'
import type { FeeSettings } from '@/lib/types'

export default function CartPage() {
  const { items, setQty, remove, total } = useCart()
  const { t } = useLang()
  const { cny, jpy, rates } = useCurrency()
  const [fees, setFees] = useState<FeeSettings>(DEFAULT_FEES)

  // 读取费用设置
  useEffect(() => {
    getFees()
      .then(setFees)
      .catch(() => {})
  }, [])

  // 费用计算（美元基准 → 双币显示）
  const goodsTotal = total
  const serviceFee = goodsTotal * fees.serviceRate
  const packingFee = fees.packingJpy / rates.JPY
  const shippingFee = fees.shippingJpy / rates.JPY
  const settlementFee = fees.settlementCny / rates.CNY
  const grandTotal =
    goodsTotal +
    serviceFee +
    packingFee +
    shippingFee +
    settlementFee

  if (items.length === 0) {
    return (
      <div className="empty">
        <h1>{t('yourCart')}</h1>
        <p>{t('cartEmpty')}</p>
        <Link className="btn btn-primary" href="/">
          {t('browseProducts')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1>{t('yourCart')}</h1>
      <table className="table">
        <thead>
          <tr>
            <th>{t('product')}</th>
            <th>{t('price')}</th>
            <th>{t('qty')}</th>
            <th>{t('subtotal')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="cell-product">
                  {item.image_url ? (
                    <img className="cell-img" src={item.image_url} alt="" />
                  ) : null}
                  <Link href={`/product/${item.id}`}>{item.name}</Link>
                </div>
              </td>
              <td>
                {cny(item.price)}
                <br />
                <span className="price-jpy">{jpy(item.price)}</span>
              </td>
              <td>
                <div className="qty">
                  <button type="button" onClick={() => setQty(item.id, item.qty - 1)}>
                    −
                  </button>
                  <span>{item.qty}</span>
                  <button type="button" onClick={() => setQty(item.id, item.qty + 1)}>
                    ＋
                  </button>
                </div>
              </td>
              <td>
                {cny(item.price * item.qty)}
                <br />
                <span className="price-jpy">
                  {jpy(item.price * item.qty)}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => remove(item.id)}
                >
                  {t('remove')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 费用明细（与合计格式一致） */}
      <div className="fee-list">
        <div className="fee-row">
          <span>{t('goodsTotal')}</span>
          <strong>
            {cny(goodsTotal)} / {jpy(goodsTotal)}
          </strong>
        </div>
        <div className="fee-row">
          <span>
            {t('serviceFee')}（{Math.round(fees.serviceRate * 100)}%）
          </span>
          <strong>
            {cny(serviceFee)} / {jpy(serviceFee)}
          </strong>
        </div>
        <div className="fee-row">
          <span>{t('packingFee')}</span>
          <strong>
            {cny(packingFee)} / {jpy(packingFee)}
          </strong>
        </div>
        <div className="fee-row">
          <span>{t('shippingFee')}</span>
          <strong>
            {cny(shippingFee)} / {jpy(shippingFee)}
          </strong>
        </div>
        <div className="fee-row">
          <span>{t('settlementFee')}</span>
          <strong>
            {cny(settlementFee)} / {jpy(settlementFee)}
          </strong>
        </div>
        <div className="fee-row fee-total">
          <span>{t('total')}:</span>
          <strong>
            {cny(grandTotal)} / {jpy(grandTotal)}
          </strong>
        </div>
      </div>

      <div className="cart-actions">
        <Link className="btn btn-primary" href="/checkout">
          {t('proceedToCheckout')}
        </Link>
      </div>
      <p className="muted" style={{ marginTop: 12 }}>
        {t('maxOrder', { n: MAX_ORDER })} · {t('paymentNote')}
      </p>
    </div>
  )
}
