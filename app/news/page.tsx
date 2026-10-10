import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-service'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import type { News } from '@/lib/types'

// 新闻页：显示后台发布的新闻
export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  const db = createServiceClient()
  const { data } = await db
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })
  const news = (data ?? []) as News[]

  return (
    <div>
      <h1>{tr(dict, 'newsTitle')}</h1>
      {news.length === 0 ? (
        <div className="admin-panel">
          <p>{tr(dict, 'newsComingSoon')}</p>
        </div>
      ) : (
        news.map((n) => (
          <div className="news-item" key={n.id}>
            <h3>{n.title}</h3>
            <div className="news-date">
              {new Date(n.created_at).toLocaleDateString()}
            </div>
            {n.content ? <p>{n.content}</p> : null}
          </div>
        ))
      )}
    </div>
  )
}
