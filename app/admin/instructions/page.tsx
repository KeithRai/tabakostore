import AdminNav from '@/components/admin-nav'
import { requireAdmin } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase-service'
import { parseInstructions } from '@/lib/instructions'
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
  const instructions = parseInstructions(data?.content)
  return (
    <div>
      <AdminNav active="instructions" />
      <InstructionsClient
        initialTitle={instructions.title}
        initialContent={instructions.body}
      />
    </div>
  )
}
