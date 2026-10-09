'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useCart } from '@/components/cart-provider'
import { useLang } from '@/components/lang-provider'
import { createOrder } from './actions'
import PaymentModal from '@/components/payment-modal'
import { usd } from '@/lib/format'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const { t } = useLang()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ orderNo: string; total: number } | null>(
    null
  )

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!data.user) {
          router.push('/login?next=/checkout')
        } else {
          setEmail(data.user.email ?? '')
        }
      })
  }, [router])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const info = {
      full_name: String(fd.get('full_name') ?? '').trim(),
      country: String(fd.get('country') ?? '').trim(),
      address: String(fd.get('address') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
    }
    if (!info.full_name || !info.country || !info.address) {
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
            {i.name} × {i.qty} — {usd(i.price * i.qty)}
          </li>
        ))}
      </ul>
      <div className="cart-total">
        <span>{t('total')}:</span>
        <strong>{usd(total)}</strong>
      </div>

      <h2>{t('shippingInfo')}</h2>
      <div className="field">
        <label className="label">{t('email')}</label>
        <input className="input" type="email" value={email} readOnly />
      </div>
      <div className="field">
        <label className="label">{t('fullName')}</label>
        <input className="input" name="full_name" required />
      </div>
      <div className="field">
        <label className="label">{t('country')}</label>
        <input
          className="input"
          name="country"
          required
          placeholder={t('countryPlaceholder')}
        />
      </div>
      <div className="field">
        <label className="label">{t('address')}</label>
        <textarea
          className="input"
          name="address"
          required
          rows={3}
          placeholder={t('addressPlaceholder')}
        />
      </div>
      <div className="field">
        <label className="label">{t('phone')}</label>
        <input className="input" name="phone" />
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
