import { createServiceClient } from './supabase-service'

// 热销商品 ID（按销量倒序）
export async function getTopSellerIds(
  limit = 8
): Promise<string[]> {
  const db = createServiceClient()
  const { data } = await db
    .from('order_items')
    .select('product_id, quantity')
  const map = new Map<string, number>()
  for (const it of data ?? []) {
    if (!it.product_id) continue
    map.set(
      it.product_id,
      (map.get(it.product_id) ?? 0) + Number(it.quantity ?? 0)
    )
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)
}
