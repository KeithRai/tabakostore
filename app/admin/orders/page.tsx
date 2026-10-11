import AdminNav from '@/components/admin-nav'
import { requireAdmin } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase-service'
import { cleanupExpiredOrders } from '@/lib/order-utils'
import OrdersClient from './orders-client'
import type { Order } from '@/lib/types'

export default async function AdminOrdersPage() {
  await requireAdmin()
  // 清理超过 24 小时未付款的待支付订单
  await cleanupExpiredOrders()
  const db = createServiceClient()
  const { data } = await db
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  return (
    <div>
      <AdminNav active="orders" />
      <OrdersClient orders={(data ?? []) as Order[]} />
    </div>
  )
}
