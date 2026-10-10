'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

// 更新用户资料（昵称、头像、性别、生日、地址、手机号；邮箱不可改）
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Please log in first.' }
  }

  const nickname = String(formData.get('nickname') ?? '').trim()
  const gender = String(formData.get('gender') ?? '')
  const birthday = String(formData.get('birthday') ?? '')
  const address = String(formData.get('address') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()

  if (!nickname) {
    return { error: 'Nickname is required.' }
  }

  // 头像上传
  let avatarUrl = String(
    (user.user_metadata as Record<string, unknown>)?.avatar_url ?? ''
  )
  const maybeFile = formData.get('avatar')
  if (maybeFile instanceof File && maybeFile.size > 0) {
    const db = createServiceClient()
    const ext = (maybeFile.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await db.storage
      .from('avatars')
      .upload(path, maybeFile, {
        contentType: maybeFile.type || 'image/jpeg',
        upsert: true,
      })
    if (uploadError) {
      return { error: '头像上传失败：' + uploadError.message }
    }
    avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`
  }

  const { error: updateError } = await createServiceClient().auth.admin.updateUserById(
    user.id,
    {
      user_metadata: {
        nickname,
        gender,
        birthday,
        address,
        phone,
        avatar_url: avatarUrl,
      },
    }
  )
  if (updateError) {
    return { error: '保存失败：' + updateError.message }
  }

  revalidatePath('/profile')
  revalidatePath('/', 'layout')
  return { success: true }
}
