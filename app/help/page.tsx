import { cookies } from 'next/headers'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import ContactButton from '@/components/contact-button'

// 帮助页：常见问题
export default async function HelpPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  return (
    <div>
      <h1>{tr(dict, 'helpTitle')}</h1>
      <div className="admin-panel">
        <h3 style={{ marginTop: 0 }}>{tr(dict, 'helpPaymentQ')}</h3>
        <p>{tr(dict, 'helpPaymentA')}</p>
      </div>
      <div className="admin-panel">
        <h3 style={{ marginTop: 0 }}>{tr(dict, 'helpContactQ')}</h3>
        <p>{tr(dict, 'helpContactA')}</p>
      </div>
      <ContactButton />
    </div>
  )
}
