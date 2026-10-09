'use client'

import { useState } from 'react'
import { useCart } from './cart-provider'
import { useLang } from './lang-provider'
import type { Product } from '@/lib/types'

export default function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart()
  const { t } = useLang()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const price = parseFloat(product.price)
  const out = product.stock <= 0

  return (
    <div className="buy-box">
      <div className="qty">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
          −
        </button>
        <input
          value={qty}
          onChange={(e) =>
            setQty(
              Math.max(1, Math.min(Math.max(product.stock, 1), parseInt(e.target.value) || 1))
            )
          }
        />
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))}
        >
          ＋
        </button>
      </div>
      <button
        className="btn btn-primary"
        disabled={out}
        onClick={() => {
          add(
            { id: product.id, name: product.name, price, image_url: product.image_url },
            qty
          )
          setAdded(true)
          setTimeout(() => setAdded(false), 1500)
        }}
      >
        {out ? t('outOfStock') : added ? 'Added ✓' : t('addToCart')}
      </button>
    </div>
  )
}
