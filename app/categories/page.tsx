import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase-service'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import ProductCard from '@/components/product-card'
import type { Product } from '@/lib/types'

// 种类页：按分类筛选商品
export const dynamic = 'force-dynamic'

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const selected = (cat ?? '').trim()

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

  // 提取分类列表（按商品出现顺序）
  const uncategorized = tr(dict, 'uncategorized')
  const categoryNames: string[] = []
  for (const p of products) {
    const c = p.category || uncategorized
    if (!categoryNames.includes(c)) categoryNames.push(c)
  }

  const shown = selected
    ? products.filter(
        (p) => (p.category || uncategorized) === selected
      )
    : products

  return (
    <div>
      <h1>{tr(dict, 'categoriesTitle')}</h1>

      {/* 分类筛选标签 */}
      <div className="category-list">
        <Link
          href="/categories"
          className={`category-chip${!selected ? ' active' : ''}`}
        >
          {tr(dict, 'allCategories')}
        </Link>
        {categoryNames.map((c) => (
          <Link
            key={c}
            href={`/categories?cat=${encodeURIComponent(c)}`}
            className={`category-chip${selected === c ? ' active' : ''}`}
          >
            {c}
          </Link>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <p>{tr(dict, 'noProducts')}</p>
        </div>
      ) : (
        <div className="grid">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
