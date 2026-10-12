'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { MAX_ORDER, MAX_PER_ITEM } from '@/lib/constants'
import { getRates, formatCNY, formatJPY } from '@/lib/currency'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { decrementStock, incrementStock } from '@/lib/order-utils'
import { getFees } from '@/app/admin/actions'
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

  // 整单合计上限
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  if (totalQty > MAX_ORDER) {
    return { error: `Maximum ${MAX_ORDER} items per order.` }
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
    if (item.qty > MAX_PER_ITEM) {
      return {
        error: `Maximum ${MAX_PER_ITEM} of "${p.name}" per order.`,
      }
    }
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

  // ===== 并发安全：原子扣减库存 =====
  // 数据库行级锁保证同时下单只有一个成功，不会超卖
  // 流程：先扣库存 → 再创建订单；任何一步失败都会回滚已扣的库存
  const deducted: Array<{ product_id: string; quantity: number }> = []
  for (const item of lineItems) {
    const left = await decrementStock(db, item.product_id, item.qty)
    if (left < 0) {
      // 库存不足（已被其他客户抢先购买）：回滚本次已扣减的库存
      for (const d of deducted) {
        await incrementStock(db, d.product_id, d.quantity)
      }
      return {
        error: `库存不足："${item.product_name}" 刚刚被其他客户抢先购买，请调整购物车后重试。`,
      }
    }
    deducted.push({
      product_id: item.product_id,
      quantity: item.qty,
    })
  }

  // 计入费用：服务费 + 包装费 + 国际结算手续费
  // 运费不固定：由客服确认后告知，付款时一并收取
  const fees = await getFees()
  const rates = await getRates()
  const serviceFeeUsd = total * fees.serviceRate
  const packingFeeUsd = fees.packingJpy / rates.JPY
  const settlementFeeUsd = total * fees.settlementRate
  total = Math.round(
    (total + serviceFeeUsd + packingFeeUsd + settlementFeeUsd) *
      100
  ) / 100

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
      city: info.city,
      address: info.address,
      phone: info.phone,
    })
    .select('id')
    .single()
  if (orderError || !orderData) {
    // 创建订单失败：回滚库存
    for (const d of deducted) {
      await incrementStock(db, d.product_id, d.quantity)
    }
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
    // 明细写入失败：回滚库存并删除空订单
    for (const d of deducted) {
      await incrementStock(db, d.product_id, d.quantity)
    }
    await db.from('orders').delete().eq('id', orderData.id)
    return { error: 'Failed to create order, please try again.' }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/orders', 'page')

  // 发送订单确认邮件（未配置 RESEND_API_KEY 时自动跳过）
  if (user.email) {
    await sendOrderConfirmationEmail({
      to: user.email,
      orderNo,
      totalCny: formatCNY(total, rates),
      totalJpy: formatJPY(total, rates),
    })
  }

  return { order_no: orderNo, total }
}
