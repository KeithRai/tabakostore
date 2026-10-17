'use client'

import { useState } from 'react'
import { useCart } from './cart-provider'
import { useLang } from './lang-provider'
import { useCurrentUser } from './use-current-user'
import { MAX_PER_ITEM } from '@/lib/constants'
import type { Product, SpecGroup } from '@/lib/types'

// 商品购买区：规格选择 + 数量 + 加入购物车
export default function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart()
  const { t } = useLang()
  const { isLoggedIn } = useCurrentUser()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  // 规格选择：{ 颜色: '红', 尺寸: 'M' }
  const groups: SpecGroup[] = product.variants ?? []
  const [selected, setSelected] = useState<Record<string, string>>({})
  const price = parseFloat(product.price)
  const out = product.stock <= 0
  // 数量上限 = min(库存, 20)
  const maxQty = Math.min(Math.max(product.stock, 1), MAX_PER_ITEM)

  // 未选完规格时不允许加入购物车
  const specDone = groups.every((g) => selected[g.label])
  const variantKey = groups
    .map((g) => `${g.label}:${selected[g.label] ?? ''}`)
    .join(' / ')
  const variantText = variantKey || undefined

  return (
    <div className="buy-box">
      {/* 规格选择 */}
      {groups.map((g) => (
        <div className="field" key={g.label}>
          <label className="label">
            {g.label}
          </label>
          <select
            className="input"
            value={selected[g.label] ?? ''}
            onChange={(e) =>
              setSelected((prev) => ({
                ...prev,
                [g.label]: e.target.value,
              }))
            }
          >
            <option value="">{t('selectSpec')}</option>
            {g.values.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="qty">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
        >
          −
        </button>
        <input
          value={qty}
          onChange={(e) =>
            setQty(
              Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1))
            )
          }
        />
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
        >
          ＋
        </button>
      </div>
      <button
        className="btn btn-primary"
        disabled={out || !specDone}
        onClick={() => {
          // 未登录：弹窗提醒登录
          if (!isLoggedIn) {
            alert(t('loginToAdd'))
            return
          }
          if (!specDone) {
            alert(t('selectSpec'))
            return
          }
          add(
            {
              id: product.id,
              name: product.name,
              price,
              image_url: product.image_url,
              stock: product.stock,
              variant: variantText,
              variantKey,
            },
            qty
          )
          setAdded(true)
          setTimeout(() => setAdded(false), 1500)
        }}
      >
        {out
          ? 'Out of stock'
          : !specDone
            ? t('selectSpec')
            : added
              ? 'Added ✓'
              : 'Add to cart'}
      </button>
    </div>
  )
}
