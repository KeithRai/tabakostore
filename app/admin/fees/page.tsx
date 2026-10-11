import AdminNav from '@/components/admin-nav'
import { requireAdmin } from '@/lib/admin-auth'
import FeesClient from './fees-client'

// 后台费用设置页（需登录）
export default async function AdminFeesPage() {
  await requireAdmin()
  return (
    <div>
      <AdminNav active="fees" />
      <FeesClient />
    </div>
  )
}
