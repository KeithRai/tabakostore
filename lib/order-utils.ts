import { createServiceClient } from './supabase-service'
import type { SupabaseClient } from '@supabase/supabase-js'

// 恢复订单库存（取消订单时调用）
export async function restoreOrderStock(
  db: SupabaseClient,
  orderId: string
): Promise<void> {
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
}

// 自动确认收货：发货超过 14 天未确认的订单自动变为"已收货"
// 由页面加载时调用，返回自动确认的数量
export async function autoConfirmReceipts(): Promise<number> {
  const db = createServiceClient()
  const cutoff = new Date(
    Date.now() - 14 * 24 * 3600 * 1000
  ).toISOString()
  const { data } = await db
    .from('orders')
    .update({ status: 'delivered' })
    .eq('status', 'shipped')
    .lt('shipped_at', cutoff)
    .select('id')
  return (data ?? []).length
}

// 清理过期待支付订单（超过 24 小时未付款自动取消并恢复库存）
// 由页面加载时调用，返回取消的订单数量
export async function cleanupExpiredOrders(): Promise<number> {
  const db = createServiceClient()
  const cutoff = new Date(
    Date.now() - 24 * 3600 * 1000
  ).toISOString()
  const { data: expired } = await db
    .from('orders')
    .select('id')
    .eq('status', 'pending')
    .lt('created_at', cutoff)
  let count = 0
  for (const o of expired ?? []) {
    const { error } = await db
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', o.id)
    if (!error) {
      await restoreOrderStock(db, o.id)
      count++
    }
  }
  return count
}
