import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Script from 'next/script'
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
        {tidio ? <TidioWidget code={tidio} /> : null}
      </body>
    </html>
  )
}

// 客服聊天组件：兼容"外部脚本"和"内联脚本"两种形式
function TidioWidget({ code }: { code: string }) {
  const srcMatch = code.match(/src\s*=\s*["']([^"']+)["']/)
  if (srcMatch) {
    // 外部脚本：用 next/script 正确加载执行
    const src = srcMatch[1].startsWith('//')
      ? `https:${srcMatch[1]}`
      : srcMatch[1]
    return <Script src={src} strategy="afterInteractive" />
  }
  // 内联脚本：服务端渲染到 HTML 中，浏览器解析时自动执行
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
