import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { CartProvider } from '@/components/cart-provider'
import { LangProvider } from '@/components/lang-provider'
import Navbar from '@/components/navbar'
import { LANG_LIST, type Lang } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'TabakoStore - Online Toy Shop',
  description: 'TabakoStore - fun toys shipped worldwide',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 从 cookie 读取语言偏好（默认英文）
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'

  // Tidio 客服聊天代码（在 Vercel 环境变量 TIDIO_SCRIPT 中粘贴）
  const tidio = process.env.TIDIO_SCRIPT ?? ''

  return (
    <html
      lang={lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja' : 'en'}
    >
      <body>
        <CartProvider>
          <LangProvider lang={lang}>
            <Navbar />
            <main className="container">{children}</main>
            <footer className="footer">
              © {new Date().getFullYear()} TabakoStore
            </footer>
          </LangProvider>
        </CartProvider>
        {tidio ? (
          <script dangerouslySetInnerHTML={{ __html: tidio }} />
        ) : null}
      </body>
    </html>
  )
}
