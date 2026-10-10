import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-service'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import ContactButton from '@/components/contact-button'

// 帮助页：常见问题 + 商家说明
export default async function HelpPage() {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  // 商家说明（后台可编辑）
  const db = createServiceClient()
  const { data: settingsData } = await db
    .from('settings')
    .select('content')
    .eq('id', 'instructions')
    .single()
  const instructions = settingsData?.content ?? ''

  return (
    <div>
      <h1>{tr(dict, 'helpTitle')}</h1>
      {instructions ? (
        <div className="admin-panel">
          <h3 style={{ marginTop: 0 }}>{tr(dict, 'paymentInstructions')}</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{instructions}</p>
        </div>
      ) : null}
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
