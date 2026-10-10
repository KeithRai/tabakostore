import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-service'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import ProductCard from '@/components/product-card'
import type { Product } from '@/lib/types'

// 搜索页：按名称/描述搜索商品
export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams

  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  const db = createServiceClient()
  const { data } = await db.from('products').select('*')
  const all = (data ?? []) as Product[]

  const keyword = q.trim().toLowerCase()
  const results = keyword
    ? all.filter((p) =>
        (p.name + ' ' + (p.description ?? '')).toLowerCase().includes(keyword)
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
        <button className="btn btn-primary" type="submit">
          {tr(dict, 'search')}
        </button>
      </form>
      {keyword ? (
        results.length === 0 ? (
          <div className="empty">
            <p>{tr(dict, 'noResults')}</p>
          </div>
        ) : (
          <div className="grid">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )
      ) : null}
    </div>
  )
}
