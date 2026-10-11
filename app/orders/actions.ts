'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

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
  const { data: items } = await db
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId)
  for (const item of items ?? []) {
    if (!item.product_id) continue
    const { data: prod } = await db
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single()
    if (prod) {
      await db
        .from('products')
        .update({
          stock: prod.stock + item.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.product_id)
    }
  }

  revalidatePath('/orders', 'page')
  revalidatePath('/admin/orders')
  return { success: true }
}
