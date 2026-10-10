import AdminNav from '@/components/admin-nav'
import { requireAdmin } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase-service'
import NewsClient from './news-client'
import type { News } from '@/lib/types'

// 后台新闻管理（需登录）
export default async function AdminNewsPage() {
  await requireAdmin()
  const db = createServiceClient()
  const { data } = await db
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })
  return (
    <div>
      <AdminNav active="news" />
      <NewsClient news={(data ?? []) as News[]} />
    </div>
  )
}
