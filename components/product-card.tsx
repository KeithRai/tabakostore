'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from './cart-provider'
import { useLang } from './lang-provider'
import { useCurrentUser } from './use-current-user'
import { useCurrency } from './currency-provider'
import WishlistButton from './wishlist-button'
import type { Product } from '@/lib/types'

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const { t } = useLang()
  const { isLoggedIn } = useCurrentUser()
  const { cny, jpy } = useCurrency()
  const price = parseFloat(product.price)
  const out = product.stock <= 0

  // 封面图：多图时取第一张
  const cover =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls[0]
      : product.image_url

  return (
    <div className="card">
      {/* 点击商品图跳转详情页 */}
      <Link href={`/product/${product.id}`} className="card-link">
        {cover ? (
          <div className="card-img-wrap">
            <Image
              className="card-img"
              src={cover}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ) : (
          <div className="card-img card-img-empty">{t('noImage')}</div>
        )}
        {/* 收藏按钮 */}
        <WishlistButton
          item={{
            id: product.id,
            name: product.name,
            price,
            image_url: cover,
          }}
          className="card-wish"
        />
      </Link>
      <div className="card-body">
        <h3 className="card-title">
          <Link href={`/product/${product.id}`} className="card-link">
            {product.name}
          </Link>
        </h3>
        {product.category ? (
          <p className="card-category">{product.category}</p>
        ) : null}
        {product.description ? (
          <p className="card-desc">{product.description}</p>
        ) : null}
        <div className="card-foot">
          <div>
            {/* 人民币 + 日元双币显示 */}
            <div className="price">{cny(price)}</div>
            <div className="price-jpy">{jpy(price)}</div>
          </div>
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
            onClick={() => {
              // 未登录：弹窗提醒登录
              if (!isLoggedIn) {
                alert(t('loginToAdd'))
                return
              }
              add({
                id: product.id,
                name: product.name,
                price,
                image_url: cover,
                stock: product.stock,
              })
            }}
          >
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  )
}
