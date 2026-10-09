'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import type { CartItem, CheckoutInfo } from '@/lib/types'

type Result = { error?: string; order_no?: string; total?: number }

// 创建订单：校验库存 → 锁价 → 建订单 → 扣库存
export async function createOrder(
  items: CartItem[],
  info: CheckoutInfo
): Promise<Result> {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) {
    return { error: 'Please log in first.' }
  }
  const user = authData.user

  if (items.length === 0) {
    return { error: 'Your cart is empty.' }
  }

  const db = createServiceClient()

  // 重新读取商品信息，防止前端价格被篡改
  const { data: products, error: fetchError } = await db
    .from('products')
    .select('id, name, price, stock, image_url')
    .in('id', items.map((i) => i.id))
  if (fetchError) {
    return { error: 'Failed to load products, please try again.' }
  }

  const productMap = new Map((products ?? []).map((p) => [p.id, p]))
  let total = 0
  const lineItems: Array<{
    product_id: string
    product_name: string
    price: number
    quantity: number
    image_url: string | null
  }> = []

  for (const item of items) {
    const p = productMap.get(item.id)
    if (!p) {
      return { error: `Product no longer exists: ${item.name}` }
    }
    const price = parseFloat(p.price)
    if (p.stock < item.qty) {
      return {
        error: `"${p.name}" only has ${p.stock} left in stock. Please adjust your cart.`,
      }
    }
    total += price * item.qty
    lineItems.push({
      product_id: p.id,
      product_name: p.name,
      price,
      quantity: item.qty,
      image_url: item.image_url ?? p.image_url,
    })
  }
  total = Math.round(total * 100) / 100

  const orderNo =
    'TB' +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase()

  const { data: orderData, error: orderError } = await db
    .from('orders')
    .insert({
      user_id: user.id,
      order_no: orderNo,
      total,
      status: 'pending',
      email: user.email,
      full_name: info.full_name,
      country: info.country,
      address: info.address,
      phone: info.phone || null,
    })
    .select('id')
    .single()
  if (orderError || !orderData) {
    return { error: 'Failed to create order, please try again.' }
  }

  const { error: itemsError } = await db.from('order_items').insert(
    lineItems.map((li) => ({
      order_id: orderData.id,
      product_id: li.product_id,
      product_name: li.product_name,
      price: li.price,
      quantity: li.quantity,
      image_url: li.image_url,
    }))
  )
  if (itemsError) {
    return { error: 'Failed to create order, please try again.' }
  }

  // 扣减库存
  for (const item of items) {
    const p = productMap.get(item.id)
    if (p) {
      await db
        .from('products')
        .update({ stock: Math.max(0, p.stock - item.qty), updated_at: new Date().toISOString() })
        .eq('id', item.id)
    }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/orders', 'page')

  return { order_no: orderNo, total }
}
