import { createServiceClient } from './supabase-service'
import type { SupabaseClient } from '@supabase/supabase-js'

// 原子扣减库存（并发安全）
// 成功返回剩余库存；库存不足返回 -1
export async function decrementStock(
  db: SupabaseClient,
  productId: string,
  qty: number
): Promise<number> {
  const { data, error } = await db.rpc('decrement_stock', {
    p_product_id: productId,
    p_qty: qty,
  })
  if (error) return -1
  const n = Number(data)
  return isNaN(n) ? -1 : n
}

// 原子增加库存（取消订单 / 下单失败回滚）
export async function incrementStock(
  db: SupabaseClient,
  productId: string,
  qty: number
): Promise<void> {
  await db.rpc('increment_stock', {
    p_product_id: productId,
    p_qty: qty,
  })
}

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
    await incrementStock(db, item.product_id, item.quantity)
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
