'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useCart } from '@/components/cart-provider'
import { useLang } from '@/components/lang-provider'
import { useCurrency } from '@/components/currency-provider'
import { getFees } from '@/app/admin/actions'
import { DEFAULT_FEES } from '@/lib/constants'
import { createOrder } from './actions'
import PaymentModal from '@/components/payment-modal'
import type { FeeSettings } from '@/lib/types'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const { t } = useLang()
  const { cny, jpy, rates } = useCurrency()
  const router = useRouter()
  const [fees, setFees] = useState<FeeSettings>(DEFAULT_FEES)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ orderNo: string; total: number } | null>(
    null
  )

  // 收货信息（登录后自动填入资料页保存的地址和手机号）
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  // 费用计算（美元基准 → 双币显示）
  const serviceFee = total * fees.serviceRate
  const packingFee = fees.packingJpy / rates.JPY
  const shippingFee = fees.shippingJpy / rates.JPY
  const settlementFee = fees.settlementCny / rates.CNY
  const grandTotal =
    total + serviceFee + packingFee + shippingFee + settlementFee

  // 读取费用设置
  useEffect(() => {
    getFees()
      .then(setFees)
      .catch(() => {})
  }, [])

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!data.user) {
          router.push('/login?next=/checkout')
        } else {
          setEmail(data.user.email ?? '')
          // 自动填入资料页保存的收货地址和手机号
          const meta = (data.user.user_metadata ?? {}) as Record<
            string,
            unknown
          >
          if (meta.address) setAddress(String(meta.address))
          if (meta.phone) setPhone(String(meta.phone))
        }
      })
  }, [router])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const info = {
      full_name: fullName.trim(),
      country: country.trim(),
      city: city.trim(),
      address: address.trim(),
      phone: phone.trim(),
    }
    // 姓名、国家、城市、地址、电话均为必填
    if (
      !info.full_name ||
      !info.country ||
      !info.city ||
      !info.address ||
      !info.phone
    ) {
      setError(t('fillRequired'))
      return
    }
    setBusy(true)
    setError('')
    const res = await createOrder(items, info)
    setBusy(false)
    if (res.error) {
      setError(res.error)
      return
    }
    clear()
    setResult({ orderNo: res.order_no ?? '', total: res.total ?? 0 })
  }

  // 下单成功 → 显示"联系客服支付"弹窗
  if (result) {
    return (
      <div>
        <h1>{t('checkoutTitle')}</h1>
        <PaymentModal
          orderNo={result.orderNo}
          total={result.total}
          onClose={() => router.push('/orders')}
        />
      </div>
    )
  }

  if (items.length === 0 && !busy) {
    return (
      <div className="empty">
        <h1>{t('checkoutTitle')}</h1>
        <p>{t('cartEmpty')}</p>
        <Link className="btn btn-primary" href="/">
          {t('browseProducts')}
        </Link>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h1>{t('checkoutTitle')}</h1>

      <h2>{t('orderSummary')}</h2>
      <ul className="summary">
        {items.map((i) => (
          <li key={i.id}>
            {i.name} × {i.qty} — {cny(i.price * i.qty)} /{' '}
            {jpy(i.price * i.qty)}
          </li>
        ))}
      </ul>

      {/* 费用明细（与合计格式一致） */}
      <div className="fee-list">
        <div className="fee-row">
          <span>{t('goodsTotal')}</span>
          <strong>
            {cny(total)} / {jpy(total)}
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

      <h2>{t('shippingInfo')}</h2>
      <div className="field">
        <label className="label">{t('email')}</label>
        <input className="input" type="email" value={email} readOnly />
      </div>
      <div className="field">
        <label className="label">{t('fullName')} *</label>
        <input
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label className="label">{t('country')} *</label>
        <input
          className="input"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          placeholder={t('countryPlaceholder')}
        />
      </div>
      <div className="field">
        <label className="label">{t('city')} *</label>
        <input
          className="input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          placeholder={t('cityPlaceholder')}
        />
      </div>
      <div className="field">
        <label className="label">{t('address')} *</label>
        <textarea
          className="input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          rows={3}
          placeholder={t('addressPlaceholder')}
        />
      </div>
      <div className="field">
        <label className="label">{t('phone')} *</label>
        <input
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <h2>{t('paymentMethod')}</h2>
      <div className="pay-method">
        <input type="radio" name="pay" id="pay-manual" defaultChecked readOnly />
        <label htmlFor="pay-manual">
          <strong>{t('payWechat')}</strong> — {t('payWechatDesc')}
        </label>
      </div>
      <div className="pay-method pay-disabled">
        <input type="radio" name="pay" id="pay-card" disabled />
        <label htmlFor="pay-card">
          <strong>{t('payCard')}</strong> — {t('payCardDesc')}
        </label>
      </div>

      {error ? <div className="alert">{error}</div> : null}
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? t('placingOrder') : t('placeOrder')}
      </button>
    </form>
  )
}
