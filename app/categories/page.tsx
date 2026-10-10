import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-service'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import ProductCard from '@/components/product-card'
import type { Product } from '@/lib/types'

// 种类页：按分类浏览商品（当前所有商品都在"全部商品"下）
export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  const db = createServiceClient()
  const { data } = await db
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  const products = (data ?? []) as Product[]

  return (
    <div>
      <h1>{tr(dict, 'categoriesTitle')}</h1>
      <h2>{tr(dict, 'allProducts')}</h2>
      {products.length === 0 ? (
        <div className="empty">
          <p>{tr(dict, 'noProducts')}</p>
        </div>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
