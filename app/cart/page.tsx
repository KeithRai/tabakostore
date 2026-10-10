'use client'

import Link from 'next/link'
import { useCart } from '@/components/cart-provider'
import { useLang } from '@/components/lang-provider'
import { usd } from '@/lib/format'
import { MAX_ORDER } from '@/lib/constants'

export default function CartPage() {
  const { items, setQty, remove, total } = useCart()
  const { t } = useLang()

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
              <td>{usd(item.price)}</td>
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
              <td>{usd(item.price * item.qty)}</td>
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
      <div className="cart-total">
        <span>{t('total')}:</span>
        <strong>{usd(total)}</strong>
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
