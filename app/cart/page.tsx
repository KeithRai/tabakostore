'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/cart-provider'
import { useLang } from '@/components/lang-provider'
import { useCurrency } from '@/components/currency-provider'
import { getFees } from '@/app/admin/actions'
import { getProductStocks } from '@/app/actions'
import { DEFAULT_FEES, MAX_ORDER } from '@/lib/constants'
import type { FeeSettings } from '@/lib/types'

export default function CartPage() {
  const { items, setQty, remove, total, updateStocks } = useCart()
  const { t } = useLang()
  const { cny, jpy, rates } = useCurrency()
  const [fees, setFees] = useState<FeeSettings>(DEFAULT_FEES)
  // 商品实时库存（用于限制购物车数量上限）
  const [stocks, setStocks] = useState<Record<string, number>>({})

  // 读取费用设置
  useEffect(() => {
    getFees()
      .then(setFees)
      .catch(() => {})
  }, [])

  // 读取商品实时库存，并同步到购物车（超过库存的数量自动下调）
  useEffect(() => {
    getProductStocks()
      .then((map) => {
        setStocks(map)
        updateStocks(map)
      })
      .catch(() => {})
  }, [updateStocks])

  // 费用计算（美元基准 → 双币显示）
  // 运费不固定：由客服确认后告知
  const goodsTotal = total
  const serviceFee = goodsTotal * fees.serviceRate
  const packingFee = fees.packingJpy / rates.JPY
  const settlementFee = goodsTotal * fees.settlementRate
  const grandTotal =
    goodsTotal + serviceFee + packingFee + settlementFee

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
          {items.map((item) => {
            // 实时库存（undefined 表示还没读取到）
            const stock = stocks[item.id]
            // 数量已达库存上限
            const atStockLimit = stock !== undefined && item.qty >= stock
            return (
            <tr key={item.id}>
              <td>
                <div className="cell-product">
                  {item.image_url ? (
                    <Image
                      className="cell-img"
                      src={item.image_url}
                      alt=""
                      width={48}
                      height={48}
                    />
                  ) : null}
                  <div>
                    <Link href={`/product/${item.id}`}>{item.name}</Link>
                    {item.variant ? (
                      <p
                        className="muted"
                        style={{ fontSize: 12, margin: '2px 0 0' }}
                      >
                        {item.variant}
                      </p>
                    ) : null}
                    {/* 库存提示：数量已达库存上限时显示 */}
                    {atStockLimit ? (
                      <p className="muted" style={{ fontSize: 12 }}>
                        {t('stockReached', { n: stock ?? 0 })}
                      </p>
                    ) : null}
                  </div>
                </div>
              </td>
              <td>
                {cny(item.price)}
                <br />
                <span className="price-jpy">{jpy(item.price)}</span>
              </td>
              <td>
                <div className="qty">
                  <button
                    type="button"
                    onClick={() =>
                      setQty(
                        item.id,
                        item.qty - 1,
                        item.variantKey ?? ''
                      )
                    }
                  >
                    −
                  </button>
                  <span>{item.qty}</span>
                  {/* 加号按钮：数量不能超过实时库存 */}
                  <button
                    type="button"
                    disabled={atStockLimit}
                    onClick={() =>
                      setQty(item.id, item.qty + 1, item.variantKey ?? '')
                    }
                  >
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
            )
          })}
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
          <strong className="muted">
            {t('shippingConfirmed')}
          </strong>
        </div>
        <div className="fee-row">
          <span>
            {t('settlementFee')}（
            {Math.round(fees.settlementRate * 100)}%）
          </span>
          <strong>
            {cny(settlementFee)} / {jpy(settlementFee)}
          </strong>
        </div>
        <div className="fee-row fee-total">
          <span>{t('totalExclShipping')}:</span>
          <strong>
            {cny(grandTotal)} / {jpy(grandTotal)}
          </strong>
        </div>
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        {t('shippingNote')}
      </p>

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
