'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { restoreOrderStock } from '@/lib/order-utils'

// 用户取消订单（仅限待支付订单），取消后同步到管理后台
export async function cancelOrder(orderId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Please log in first.' }
  }

  const db = createServiceClient()

  // 确认订单属于当前用户
  const { data: order } = await db
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()
  if (!order) {
    return { error: 'Order not found.' }
  }
  if (order.status !== 'pending') {
    return { error: '只有待支付的订单可以取消。' }
  }

  // 更新订单状态
  const { error: updateError } = await db
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
  if (updateError) {
    return { error: '取消失败：' + updateError.message }
  }

  // 恢复商品库存
  await restoreOrderStock(db, orderId)

  revalidatePath('/orders', 'page')
  revalidatePath('/admin/orders')
  return { success: true }
}

// 客户确认收货（仅限已发货订单）
export async function confirmReceipt(orderId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Please log in first.' }
  }

  const db = createServiceClient()

  // 确认订单属于当前用户且状态为已发货
  const { data: order } = await db
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()
  if (!order) {
    return { error: 'Order not found.' }
  }
  if (order.status !== 'shipped') {
    return { error: '只有已发货的订单可以确认收货。' }
  }

  const { error } = await db
    .from('orders')
    .update({ status: 'delivered' })
    .eq('id', orderId)
  if (error) {
    return { error: '操作失败：' + error.message }
  }

  revalidatePath('/orders', 'page')
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/admin/orders')
  return { success: true }
}

// 待确认收货数量（导航栏图标角标）
export async function getReceiptBadgeCount(): Promise<number> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const db = createServiceClient()
  const { count } = await db
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'shipped')
  return count ?? 0
}
