import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ProfileClient from './profile-client'

// 用户个人资料页（需登录）
export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile')

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>

  return (
    <ProfileClient
      email={user.email ?? ''}
      nickname={String(meta.nickname ?? '')}
      gender={String(meta.gender ?? '')}
      birthday={String(meta.birthday ?? '')}
      address={String(meta.address ?? '')}
      phone={String(meta.phone ?? '')}
      avatarUrl={String(meta.avatar_url ?? '')}
    />
  )
}
