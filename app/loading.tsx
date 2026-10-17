import { cookies } from 'next/headers'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'

// 页面加载动画（路由切换时显示）
export default async function Loading() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  return (
    <div className="loading-box">
      <div className="spinner" aria-hidden="true" />
      <p className="muted">{tr(dict, 'loading')}</p>
    </div>
  )
}
