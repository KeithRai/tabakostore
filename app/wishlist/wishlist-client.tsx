'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/components/lang-provider'
import { useCurrency } from '@/components/currency-provider'
import { useWishlist } from '@/components/wishlist-provider'
import { useCart } from '@/components/cart-provider'
import type { Product } from '@/lib/types'

// 收藏夹页面：展示本机收藏的商品
export default function WishlistPage() {
  const { t } = useLang()
  const { cny, jpy } = useCurrency()
  const { items, remove, ready } = useWishlist()
  const { add } = useCart()
  const [products, setProducts] = useState<Product[]>([])

  // 用收藏的商品 ID 拉取最新商品信息
  useEffect(() => {
    if (!ready || items.length === 0) {
      setProducts([])
      return
    }
    let cancelled = false
    async function load() {
      const res = await fetch('/api/products?ids=' + items.map((i) => i.id).join(','))
      if (!res.ok) return
      const data = (await res.json()) as Product[]
      if (cancelled) return
      const map = new Map(data.map((p) => [p.id, p]))
      setProducts(
        items
          .map((i) => map.get(i.id))
          .filter((p): p is Product => Boolean(p))
      )
    }
    load()
    return () => {
      cancelled = true
    }
  }, [items, ready])

  return (
    <div>
      <h1>{t('wishlist')}</h1>

      {products.length === 0 ? (
        <div className="empty">
          <p>{t('wishlistEmpty')}</p>
          <p className="muted">{t('wishlistEmptyHint')}</p>
          <Link className="btn btn-primary" href="/">
            {t('browseProducts')}
          </Link>
        </div>
      ) : (
        <div className="grid">
          {products.map((p) => {
            const price = parseFloat(p.price)
            const cover =
              p.image_urls && p.image_urls.length > 0
                ? p.image_urls[0]
                : p.image_url
            return (
              <div className="card" key={p.id}>
                <Link
                  href={`/product/${p.id}`}
                  className="card-link"
                >
                  {cover ? (
                    <div className="card-img-wrap">
                      <Image
                        className="card-img"
                        src={cover}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </div>
                  ) : null}
                </Link>
                <div className="card-body">
                  <h3 className="card-title">
                    <Link href={`/product/${p.id}`}>{p.name}</Link>
                  </h3>
                  <div className="card-foot">
                    <div>
                      <div className="price">{cny(price)}</div>
                      <div className="price-jpy">{jpy(price)}</div>
                    </div>
                    <span className="stock">{p.stock}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={p.stock <= 0}
                      onClick={() =>
                        add({
                          id: p.id,
                          name: p.name,
                          price,
                          image_url: cover,
                          stock: p.stock,
                        })
                      }
                    >
                      {t('addToCart')}
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => remove(p.id)}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
