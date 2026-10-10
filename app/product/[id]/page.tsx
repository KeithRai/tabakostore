import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-service'
import { usd } from '@/lib/format'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import { MAX_ORDER, MAX_PER_ITEM } from '@/lib/constants'
import AddToCartButton from '@/components/add-to-cart-button'
import ProductGallery from '@/components/product-gallery'
import type { Product } from '@/lib/types'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  const db = createServiceClient()
  const { data } = await db.from('products').select('*').eq('id', id).single()
  if (!data) notFound()
  const product = data as Product

  // 多张图片（优先用 image_urls）
  const images: string[] =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : product.image_url
        ? [product.image_url]
        : []

  return (
    <div className="two-col">
      <div>
        <ProductGallery images={images} name={product.name} />
      </div>
      <div>
        <h1>{product.name}</h1>
        {product.category ? (
          <p className="muted">{product.category}</p>
        ) : null}
        <div className="price" style={{ fontSize: 28 }}>
          {usd(product.price)}
        </div>
        <p className={product.stock > 0 ? 'stock' : 'stock stock-out'}>
          {product.stock > 0
            ? tr(dict, 'inStock', { n: product.stock })
            : tr(dict, 'outOfStock')}
        </p>
        {/* 数量选择 + 加入购物车 */}
        <AddToCartButton product={product} />
        {/* 购买上限提醒 */}
        <p className="muted" style={{ marginTop: 8 }}>
          {tr(dict, 'maxPerItem', { n: MAX_PER_ITEM })} ·{' '}
          {tr(dict, 'maxOrder', { n: MAX_ORDER })}
        </p>
        {/* 商品描述（放在数量和加入购物车按钮下方） */}
        {product.description ? (
          <p style={{ marginTop: 12 }}>{product.description}</p>
        ) : null}
      </div>
    </div>
  )
}
