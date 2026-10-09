import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// 使用 Web Crypto 计算 SHA-256（Node 和 Edge 运行时都可用）
export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// 管理密码对应的令牌值（cookie 里存的是密码的哈希，而不是密码本身）
export async function adminToken(): Promise<string> {
  return sha256(process.env.ADMIN_PASSWORD ?? '')
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value ?? ''
  return token !== '' && token === (await adminToken())
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect('/admin/login')
  }
}
