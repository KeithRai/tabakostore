import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-service'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import { buildMetadata } from '@/lib/seo'
import ProductCard from '@/components/product-card'
import type { Product } from '@/lib/types'

// 搜索页：按名称/描述搜索商品 + 分类筛选，搜索栏下方显示推荐商品
export const dynamic = 'force-dynamic'

// SEO
export function generateMetadata() {
  return buildMetadata('search')
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>
}) {
  const { q = '', cat = '' } = await searchParams

  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  const db = createServiceClient()
  const { data } = await db.from('products').select('*')
  const all = (data ?? []) as Product[]

  // 分类列表（未分类的商品归入"未分类"）
  const uncategorized = tr(dict, 'uncategorized')
  const categories: string[] = []
  for (const p of all) {
    const c = p.category || uncategorized
    if (!categories.includes(c)) categories.push(c)
  }

  // 按分类过滤
  const matchCategory = (p: Product) =>
    !cat || (p.category || uncategorized) === cat

  const keyword = q.trim().toLowerCase()
  const showFiltered = Boolean(keyword || cat)
  const results = showFiltered
    ? all.filter(
        (p) =>
          matchCategory(p) &&
          (!keyword ||
            (p.name + ' ' + (p.description ?? ''))
              .toLowerCase()
              .includes(keyword))
      )
    : []

  return (
    <div>
      <h1>{tr(dict, 'search')}</h1>
      <form className="search-bar" method="get" action="/search">
        <input
          className="input"
          name="q"
          defaultValue={q}
          placeholder={tr(dict, 'searchPlaceholder')}
        />
        {/* 分类筛选 */}
        <select
          className="input search-cat"
          name="cat"
          defaultValue={cat}
        >
          <option value="">{tr(dict, 'allCategories')}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" type="submit">
          {tr(dict, 'search')}
        </button>
      </form>

      {showFiltered ? (
        results.length === 0 ? (
          <div className="empty">
            <p>{tr(dict, 'noResults')}</p>
          </div>
        ) : (
          <>
            {cat ? (
              <p className="muted">
                {tr(dict, 'categories')}: {cat}（{results.length}）
              </p>
            ) : null}
            <div className="grid">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )
      ) : (
        /* 搜索栏下方：推荐商品 */
        <>
          <h2>{tr(dict, 'recommended')}</h2>
          {all.length === 0 ? (
            <div className="empty">
              <p>{tr(dict, 'noProducts')}</p>
            </div>
          ) : (
            <div className="grid">
              {all.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
