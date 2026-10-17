import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase-service'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import { PAGE_SIZE } from '@/lib/constants'
import { cleanupExpiredOrders } from '@/lib/order-utils'
import { getTopSellerIds } from '@/lib/sales'
import { buildMetadata } from '@/lib/seo'
import ProductCard from '@/components/product-card'
import HistorySection from '@/components/history-section'
import WelcomeMarker from '@/components/welcome-marker'
import type { Product } from '@/lib/types'

// 主页：Banner + 热销 + 新品 + 全部商品（分页）
export const dynamic = 'force-dynamic'

// SEO
export function generateMetadata() {
  return buildMetadata()
}

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

  // 清理超过 24 小时未付款的待支付订单
  await cleanupExpiredOrders()

  // 欢迎语只在第一次访问时显示
  const firstVisit = !cookieStore.get('welcomed')?.value

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

  // 新品（最新上架 8 件）
  const { data: fresh } = await db
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8)
  const newProducts = (fresh ?? []) as Product[]

  // 热销商品（按销量 8 件）
  const topIds = await getTopSellerIds(8)
  let topProducts: Product[] = []
  if (topIds.length > 0) {
    const { data: tops } = await db
      .from('products')
      .select('*')
      .in('id', topIds)
    const map = new Map(
      ((tops ?? []) as Product[]).map((p) => [p.id, p])
    )
    topProducts = topIds
      .map((id) => map.get(id))
      .filter((p): p is Product => Boolean(p))
  }

  return (
    <div>
      {/* 首页 Banner */}
      <section className="home-banner">
        <div className="banner-inner">
          <h1 className="banner-title">
            {tr(dict, 'bannerTitle')}
          </h1>
          <p className="banner-sub">{tr(dict, 'bannerSub')}</p>
          <div className="banner-actions">
            <Link
              className="btn btn-primary"
              href="#best-sellers"
            >
              {tr(dict, 'bannerHot')}
            </Link>
            <Link
              className="btn btn-outline"
              href="#new-arrivals"
            >
              {tr(dict, 'bannerNew')}
            </Link>
          </div>
        </div>
        <div className="banner-emoji" aria-hidden="true">
          🧸 🚗 🧩
        </div>
      </section>

      {firstVisit ? (
        <p className="muted" style={{ marginBottom: 20 }}>
          {tr(dict, 'welcomeSub')}
        </p>
      ) : null}
      {firstVisit ? <WelcomeMarker /> : null}

      {/* 热销排行 */}
      {topProducts.length > 0 ? (
        <section id="best-sellers" style={{ marginTop: 8 }}>
          <h2>🔥 {tr(dict, 'bestSellers')}</h2>
          <div className="grid">
            {topProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {/* 新品上架 */}
      {newProducts.length > 0 ? (
        <section id="new-arrivals" style={{ marginTop: 28 }}>
          <h2>✨ {tr(dict, 'newArrivals')}</h2>
          <div className="grid">
            {newProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {/* 最近浏览（本地记录） */}
      <HistorySection />

      {/* 全部商品 */}
      <section style={{ marginTop: 28 }}>
        <h2>{tr(dict, 'products')}</h2>
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (p) => (
                <Link
                  key={p}
                  href={`/?page=${p}`}
                  className={p === safePage ? 'active' : ''}
                >
                  {p}
                </Link>
              )
            )}
            {safePage < totalPages && (
              <Link href={`/?page=${safePage + 1}`}>
                {tr(dict, 'nextPage')}
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
