import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import { cookies } from 'next/headers'
import { buildMetadata } from '@/lib/seo'

// SEO
export function generateMetadata() {
  return buildMetadata('privacyTitle')
}

// 隐私政策
export default async function PrivacyPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  return (
    <div>
      <h1>{tr(dict, 'privacyTitle')}</h1>
      <p>{tr(dict, 'privacyIntro')}</p>

      <h2>{tr(dict, 'privacyCollectTitle')}</h2>
      <p>{tr(dict, 'privacyCollect')}</p>

      <h2>{tr(dict, 'privacyUseTitle')}</h2>
      <p>{tr(dict, 'privacyUse')}</p>

      <h2>{tr(dict, 'privacyShareTitle')}</h2>
      <p>{tr(dict, 'privacyShare')}</p>

      <h2>{tr(dict, 'privacyCookiesTitle')}</h2>
      <p>{tr(dict, 'privacyCookies')}</p>

      <h2>{tr(dict, 'privacyChildrenTitle')}</h2>
      <p>{tr(dict, 'privacyChildren')}</p>

      <h2>{tr(dict, 'privacyContactTitle')}</h2>
      <p>{tr(dict, 'privacyContact')}</p>
    </div>
  )
}
