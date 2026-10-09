import { requireAdmin } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase-service'
import OrdersClient from './orders-client'
import type { Order } from '@/lib/types'

export default async function AdminOrdersPage() {
  await requireAdmin()
  const db = createServiceClient()
  const { data } = await db
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  return <OrdersClient orders={(data ?? []) as Order[]} />
}
