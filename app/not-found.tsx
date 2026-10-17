import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'

// 404 页面
export default async function NotFound() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  return (
    <div className="empty notfound">
      <div className="notfound-code">404</div>
      <h1>{tr(dict, 'notFoundTitle')}</h1>
      <p className="muted">{tr(dict, 'notFoundSub')}</p>
      <div
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: 12,
        }}
      >
        <Link className="btn btn-primary" href="/">
          {tr(dict, 'backHome')}
        </Link>
        <Link className="btn btn-outline" href="/help">
          {tr(dict, 'helpTitle')}
        </Link>
      </div>
    </div>
  )
}
