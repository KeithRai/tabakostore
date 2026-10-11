import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-service'
import {
  getRates,
  formatCNY,
  formatJPY,
} from '@/lib/currency'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import { MAX_ORDER, MAX_PER_ITEM } from '@/lib/constants'
import AddToCartButton from '@/components/add-to-cart-button'
import ProductGallery from '@/components/product-gallery'
import ReviewSection from '@/components/review-section'
import { buildMetadata } from '@/lib/seo'
import { getReviews } from './actions'
import type { Product } from '@/lib/types'

// SEO（标题使用商品名称）
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = createServiceClient()
  const { data } = await db
    .from('products')
    .select('name')
    .eq('id', id)
    .single()
  return buildMetadata(undefined, data?.name)
}

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

  // 实时汇率
  const rates = await getRates()

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

  // 商品评价
  const reviews = await getReviews(id)

  return (
    <>
      <div className="two-col">
      <div>
        <ProductGallery images={images} name={product.name} />
      </div>
      <div>
        <h1>{product.name}</h1>
        {product.category ? (
          <p className="muted">{product.category}</p>
        ) : null}
        {/* 人民币 + 日元双币显示 */}
        <div className="price" style={{ fontSize: 28 }}>
          {formatCNY(parseFloat(product.price), rates)}
        </div>
        <div className="price-jpy" style={{ fontSize: 16 }}>
          {formatJPY(parseFloat(product.price), rates)}
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

      {/* 商品评价 */}
      <div style={{ marginTop: 32 }}>
        <ReviewSection productId={id} initialReviews={reviews} />
      </div>
    </>
  )
}
