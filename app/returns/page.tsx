import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import { cookies } from 'next/headers'
import { buildMetadata } from '@/lib/seo'

// SEO
export function generateMetadata() {
  return buildMetadata('returnsTitle')
}

// 退换货政策
export default async function ReturnsPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  return (
    <div>
      <h1>{tr(dict, 'returnsTitle')}</h1>
      <p>{tr(dict, 'returnsIntro')}</p>

      <h2>{tr(dict, 'returnsPeriodTitle')}</h2>
      <p>{tr(dict, 'returnsPeriod')}</p>

      <h2>{tr(dict, 'returnsConditionTitle')}</h2>
      <p>{tr(dict, 'returnsCondition')}</p>

      <h2>{tr(dict, 'returnsNotAllowedTitle')}</h2>
      <p>{tr(dict, 'returnsNotAllowed')}</p>

      <h2>{tr(dict, 'returnsProcessTitle')}</h2>
      <p>{tr(dict, 'returnsProcess')}</p>

      <h2>{tr(dict, 'returnsRefundTitle')}</h2>
      <p>{tr(dict, 'returnsRefund')}</p>

      <h2>{tr(dict, 'returnsShippingTitle')}</h2>
      <p>{tr(dict, 'returnsShipping')}</p>
    </div>
  )
}
