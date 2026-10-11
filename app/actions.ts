'use server'

import { createServiceClient } from '@/lib/supabase-service'

// 批量读取商品库存（购物车页用来限制数量上限）
export async function getProductStocks(): Promise<
  Record<string, number>
> {
  const db = createServiceClient()
  const { data } = await db
    .from('products')
    .select('id, stock')
  const map: Record<string, number> = {}
  for (const p of data ?? []) {
    if (p.id) map[p.id] = p.stock ?? 0
  }
  return map
}
