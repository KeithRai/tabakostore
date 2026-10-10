import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase-service'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import { PAGE_SIZE } from '@/lib/constants'
import ProductCard from '@/components/product-card'
import type { Product } from '@/lib/types'

// 主页：分页显示商品，每页最多 20 件
export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page, 10) || 1)

  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  const db = createServiceClient()

  // 商品总数
  const { count } = await db
    .from('products')
    .select('id', { count: 'exact', head: true })
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  // 当前页的商品
  const { data } = await db
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .range((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE - 1)
  const products = (data ?? []) as Product[]

  return (
    <div>
      <h1>{tr(dict, 'welcomeTitle')}</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        {tr(dict, 'welcomeSub')}
      </p>
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

      {/* 分页：超过 20 件时显示 */}
      {totalPages > 1 && (
        <div className="pagination">
          {safePage > 1 && (
            <Link href={`/?page=${safePage - 1}`}>
              {tr(dict, 'prevPage')}
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/?page=${p}`}
              className={p === safePage ? 'active' : ''}
            >
              {p}
            </Link>
          ))}
          {safePage < totalPages && (
            <Link href={`/?page=${safePage + 1}`}>
              {tr(dict, 'nextPage')}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
