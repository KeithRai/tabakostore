'use client'

import { useState } from 'react'
import { useCart } from './cart-provider'
import { MAX_PER_ITEM } from '@/lib/constants'
import type { Product } from '@/lib/types'

export default function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const price = parseFloat(product.price)
  const out = product.stock <= 0
  // 数量上限 = min(库存, 20)
  const maxQty = Math.min(Math.max(product.stock, 1), MAX_PER_ITEM)

  return (
    <div className="buy-box">
      <div className="qty">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
          −
        </button>
        <input
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1)))}
        />
        <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>
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
        {out ? 'Out of stock' : added ? 'Added ✓' : 'Add to cart'}
      </button>
    </div>
  )
}
