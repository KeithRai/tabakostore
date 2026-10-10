'use client'

import Link from 'next/link'
import { useCart } from './cart-provider'
import { useLang } from './lang-provider'
import { usd } from '@/lib/format'
import type { Product } from '@/lib/types'

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const { t } = useLang()
  const price = parseFloat(product.price)
  const out = product.stock <= 0

  // 封面图：多图时取第一张
  const cover =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls[0]
      : product.image_url

  return (
    <div className="card">
      {cover ? (
        <img className="card-img" src={cover} alt={product.name} />
      ) : (
        <div className="card-img card-img-empty">{t('noImage')}</div>
      )}
      <div className="card-body">
        <h3 className="card-title">{product.name}</h3>
        {product.category ? (
          <p className="card-category">{product.category}</p>
        ) : null}
        {product.description ? (
          <p className="card-desc">{product.description}</p>
        ) : null}
        <div className="card-foot">
          <span className="price">{usd(price)}</span>
          <span className={out ? 'stock stock-out' : 'stock'}>
            {out ? t('outOfStock') : t('inStock', { n: product.stock })}
          </span>
        </div>
        <div className="card-actions">
          <Link className="btn btn-outline btn-sm" href={`/product/${product.id}`}>
            {t('details')}
          </Link>
          <button
            className="btn btn-primary btn-sm"
            disabled={out}
            onClick={() =>
              add({
                id: product.id,
                name: product.name,
                price,
                image_url: cover,
              })
            }
          >
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  )
}
