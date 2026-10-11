'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

type Result = { error?: string; success?: boolean }

// 读取商品评价
export async function getReviews(productId: string) {
  const db = createServiceClient()
  const { data } = await db
    .from('reviews')
    .select('id, user_id, nickname, rating, content, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Array<{
    id: string
    user_id: string
    nickname: string | null
    rating: number
    content: string
    created_at: string
  }>
}

// 发表评价（每个用户对每个商品只能评价一次）
export async function addReview(
  productId: string,
  rating: number,
  content: string
): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in first.' }

  const score = Math.round(Number(rating))
  const text = String(content ?? '').trim()
  if (!score || score < 1 || score > 5 || !text) {
    return { error: '请选择 1-5 星评分并填写评价内容' }
  }

  const nickname = String(
    (user.user_metadata ?? {}).nickname ?? ''
  )
  const db = createServiceClient()
  const { error } = await db.from('reviews').insert({
    product_id: productId,
    user_id: user.id,
    nickname: nickname || user.email?.split('@')[0] || 'User',
    rating: score,
    content: text,
  })
  if (error) {
    // 唯一约束冲突：已评价过
    if (error.code === '23505') {
      return { error: '您已评价过该商品。' }
    }
    return { error: '提交失败：' + error.message }
  }
  revalidatePath(`/product/${productId}`)
  return { success: true }
}

// 删除自己的评价
export async function deleteReview(
  reviewId: string,
  productId: string
): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in first.' }

  const db = createServiceClient()
  const { error } = await db
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)
  if (error) return { error: '删除失败：' + error.message }
  revalidatePath(`/product/${productId}`)
  return { success: true }
}
