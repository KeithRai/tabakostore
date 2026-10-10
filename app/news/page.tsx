import { cookies } from 'next/headers'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'

// 新闻页（占位页面，后续可发布店铺新闻）
export default async function NewsPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  return (
    <div>
      <h1>{tr(dict, 'newsTitle')}</h1>
      <div className="admin-panel">
        <p>{tr(dict, 'newsComingSoon')}</p>
      </div>
    </div>
  )
}
