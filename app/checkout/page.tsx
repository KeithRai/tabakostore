'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useCart } from '@/components/cart-provider'
import { useLang } from '@/components/lang-provider'
import { useCurrency } from '@/components/currency-provider'
import { createOrder } from './actions'
import PaymentModal from '@/components/payment-modal'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const { t } = useLang()
  const { cny, jpy } = useCurrency()
  const router = useRouter()
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
      <div className="cart-total">
        <span>{t('total')}:</span>
        <strong>
          {cny(total)} / {jpy(total)}
        </strong>
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
