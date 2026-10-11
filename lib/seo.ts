import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import {
  getDictionary,
  tr,
  LANG_LIST,
  type Dict,
  type Lang,
} from './i18n'

// 生成页面 SEO 信息（标题格式："页面名 | TabakoStore"）
// pageKey 使用 i18n 词条；customTitle 可传入自定义标题（如商品名）
export async function buildMetadata(
  pageKey?: keyof Dict,
  customTitle?: string
): Promise<Metadata> {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)
  const subtitle =
    customTitle ??
    (pageKey ? tr(dict, pageKey) : '')
  return {
    title: subtitle
      ? `${subtitle} | TabakoStore`
      : 'TabakoStore - Online Toy Shop',
    description: tr(dict, 'seoDescription'),
  }
}
