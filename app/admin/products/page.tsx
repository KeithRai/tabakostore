import AdminNav from '@/components/admin-nav'
import { requireAdmin } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase-service'
import ProductsClient from './products-client'
import type { Product } from '@/lib/types'

export default async function AdminProductsPage() {
  await requireAdmin()
  const db = createServiceClient()
  const { data } = await db
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return (
    <div>
      <AdminNav active="products" />
      <ProductsClient products={(data ?? []) as Product[]} />
    </div>
  )
}
