import AdminNav from '@/components/admin-nav'
import { requireAdmin } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase-service'
import InstructionsClient from './instructions-client'

// 后台帮助信息编辑（需登录）
export default async function AdminInstructionsPage() {
  await requireAdmin()
  const db = createServiceClient()
  const { data } = await db
    .from('settings')
    .select('content')
    .eq('id', 'instructions')
    .single()
  return (
    <div>
      <AdminNav active="instructions" />
      <InstructionsClient initialContent={data?.content ?? ''} />
    </div>
  )
}
