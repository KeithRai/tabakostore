import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-service'
import { usd } from '@/lib/format'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import AddToCartButton from '@/components/add-to-cart-button'
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

  return (
    <div className="two-col">
      <div>
        {product.image_url ? (
          <img className="detail-img" src={product.image_url} alt={product.name} />
        ) : (
          <div className="detail-img detail-img-empty">{tr(dict, 'noImage')}</div>
        )}
      </div>
      <div>
        <h1>{product.name}</h1>
        <div className="price" style={{ fontSize: 28 }}>
          {usd(product.price)}
        </div>
        <p className={product.stock > 0 ? 'stock' : 'stock stock-out'}>
          {product.stock > 0
            ? tr(dict, 'inStock', { n: product.stock })
            : tr(dict, 'outOfStock')}
        </p>
        {product.description ? (
          <p style={{ marginTop: 12 }}>{product.description}</p>
        ) : null}
        <AddToCartButton product={product} />
      </div>
    </div>
  )
}
