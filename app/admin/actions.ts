'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-service'
import { sha256, adminToken, requireAdmin } from '@/lib/admin-auth'
import { getRates } from '@/lib/currency'
import { DEFAULT_FEES } from '@/lib/constants'
import type { FeeSettings } from '@/lib/types'

// 管理后台登录：验证密码后写入 httpOnly cookie
export async function adminLogin(password: string) {
  const submitted = await sha256(password)
  if (submitted !== (await adminToken())) {
    return { error: '密码错误' }
  }
  const cookieStore = await cookies()
  cookieStore.set('admin_token', submitted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return { success: true }
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  return { success: true }
}

// 新增或修改商品（支持种类、多张图片）
export async function upsertProduct(formData: FormData) {
  await requireAdmin()
  const db = createServiceClient()

  const id = String(formData.get('id') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  // 后台以人民币填写价格
  const priceCny = parseFloat(String(formData.get('price') ?? ''))
  const stock = parseInt(String(formData.get('stock') ?? ''), 10)
  const category = String(formData.get('category') ?? '').trim()
  const existingImage = String(formData.get('image_url') ?? '').trim()

  // 现有图片列表（JSON 数组）
  const existingImages: string[] = (() => {
    try {
      const arr = JSON.parse(String(formData.get('existing_images') ?? '[]'))
      return Array.isArray(arr)
        ? arr.filter((x): x is string => typeof x === 'string')
        : []
    } catch {
      return []
    }
  })()

  if (
    !name ||
    isNaN(priceCny) ||
    priceCny < 0 ||
    isNaN(stock) ||
    stock < 0
  ) {
    return { error: '请填写完整信息：名称必填，价格和库存必须是数字' }
  }

  // 人民币价格 → 美元（数据库存储基准，按实时汇率换算）
  const rates = await getRates()
  const price = Math.round((priceCny / rates.CNY) * 100) / 100

  // 上传新图片（可多张）
  const newImages: string[] = []
  const files = formData.getAll('images')
  for (const f of files) {
    if (f instanceof File && f.size > 0) {
      const ext = (f.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error: uploadError } = await db.storage
        .from('product-images')
        .upload(path, f, {
          contentType: f.type || 'image/jpeg',
          upsert: true,
        })
      if (uploadError) {
        return { error: '图片上传失败：' + uploadError.message }
      }
      newImages.push(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`
      )
    }
  }

  // 最终图片列表：有新图用新图，否则保留旧图
  const finalImages = newImages.length > 0 ? newImages : existingImages
  const image_url = finalImages[0] ?? existingImage

  if (id) {
    const { error } = await db
      .from('products')
      .update({
        name,
        description,
        price,
        stock,
        category: category || null,
        image_url,
        image_urls: finalImages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (error) return { error: '保存失败：' + error.message }
  } else {
    const { error } = await db.from('products').insert({
      name,
      description,
      price,
      stock,
      category: category || null,
      image_url,
      image_urls: finalImages,
    })
    if (error) return { error: '保存失败：' + error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/')
  return { success: true }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const db = createServiceClient()
  const { error } = await db.from('products').delete().eq('id', id)
  if (error) return { error: '删除失败：' + error.message }
  revalidatePath('/admin/products')
  revalidatePath('/')
  return { success: true }
}

// 快速调整库存（商品列表 ＋/－ 按钮）
export async function adjustStock(id: string, delta: number) {
  await requireAdmin()
  const db = createServiceClient()
  const { data } = await db
    .from('products')
    .select('stock')
    .eq('id', id)
    .single()
  if (!data) return { error: '商品不存在' }
  const next = Math.max(0, (data.stock ?? 0) + delta)
  const { error } = await db
    .from('products')
    .update({ stock: next, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: '更新失败：' + error.message }
  revalidatePath('/admin/products')
  revalidatePath('/')
  return { success: true, stock: next }
}

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin()
  const db = createServiceClient()
  // 标记为已发货时记录发货时间（用于 14 天自动确认收货）
  const patch: Record<string, unknown> = { status }
  if (status === 'shipped') {
    patch.shipped_at = new Date().toISOString()
  }
  const { error } = await db.from('orders').update(patch).eq('id', id)
  if (error) return { error: '更新失败：' + error.message }
  revalidatePath('/admin/orders')
  revalidatePath('/orders', 'page')
  return { success: true }
}

// 设置库存（后台商品列表 输入件数 + 确定）
export async function setStock(id: string, stock: number) {
  await requireAdmin()
  const value = Math.max(0, Math.floor(Number(stock)))
  if (isNaN(value)) {
    return { error: '库存必须是数字' }
  }
  const db = createServiceClient()
  const { error } = await db
    .from('products')
    .update({ stock: value, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: '更新失败：' + error.message }
  revalidatePath('/admin/products')
  revalidatePath('/')
  return { success: true, stock: value }
}

// 新闻：新增或编辑（可带图片）
export async function upsertNews(formData: FormData) {
  await requireAdmin()
  const db = createServiceClient()
  const id = String(formData.get('id') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  if (!title) {
    return { error: '请填写新闻标题' }
  }

  // 新闻图片上传
  let imageUrl = String(formData.get('image_url') ?? '').trim()
  const maybeFile = formData.get('image')
  if (maybeFile instanceof File && maybeFile.size > 0) {
    const ext = (maybeFile.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: uploadError } = await db.storage
      .from('product-images')
      .upload(path, maybeFile, {
        contentType: maybeFile.type || 'image/jpeg',
        upsert: true,
      })
    if (uploadError) {
      return { error: '图片上传失败：' + uploadError.message }
    }
    imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`
  }

  if (id) {
    const { error } = await db
      .from('news')
      .update({ title, content, image_url: imageUrl || null })
      .eq('id', id)
    if (error) return { error: '保存失败：' + error.message }
  } else {
    const { error } = await db
      .from('news')
      .insert({ title, content, image_url: imageUrl || null })
    if (error) return { error: '保存失败：' + error.message }
  }

  revalidatePath('/admin/news')
  revalidatePath('/news')
  return { success: true }
}

export async function deleteNews(id: string) {
  await requireAdmin()
  const db = createServiceClient()
  const { error } = await db.from('news').delete().eq('id', id)
  if (error) return { error: '删除失败：' + error.message }
  revalidatePath('/admin/news')
  revalidatePath('/news')
  return { success: true }
}

// 商家说明：保存到 settings 表（帮助页展示，含标题和正文）
export async function updateInstructions(formData: FormData) {
  await requireAdmin()
  const db = createServiceClient()
  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '')
  const { error } = await db.from('settings').upsert({
    id: 'instructions',
    content: JSON.stringify({ title, body: content }),
    updated_at: new Date().toISOString(),
  })
  if (error) return { error: '保存失败：' + error.message }
  revalidatePath('/admin/instructions')
  revalidatePath('/help')
  return { success: true }
}

// 读取费用设置
export async function getFees(): Promise<FeeSettings> {
  const db = createServiceClient()
  const { data } = await db
    .from('settings')
    .select('content')
    .eq('id', 'fees')
    .single()
  if (data?.content) {
    try {
      const parsed = JSON.parse(data.content)
      const num = (v: unknown, fallback: number) =>
        typeof v === 'number' && v >= 0 ? v : fallback
      return {
        serviceRate: num(parsed.serviceRate, DEFAULT_FEES.serviceRate),
        packingJpy: num(parsed.packingJpy, DEFAULT_FEES.packingJpy),
        settlementRate: num(
          parsed.settlementRate,
          DEFAULT_FEES.settlementRate
        ),
      }
    } catch {
      // JSON 解析失败时使用默认值
    }
  }
  return { ...DEFAULT_FEES }
}

// 保存费用设置（后台）
// 运费不固定：由客服确认后告知，不在此设置
export async function saveFees(formData: FormData) {
  await requireAdmin()
  const serviceRate = parseFloat(
    String(formData.get('serviceRate') ?? '')
  )
  const packingJpy = parseFloat(
    String(formData.get('packingJpy') ?? '')
  )
  const settlementRate = parseFloat(
    String(formData.get('settlementRate') ?? '')
  )

  if (isNaN(serviceRate) || serviceRate < 0 || serviceRate > 100) {
    return { error: '服务费比例必须是 0-100 之间的数字' }
  }
  if (isNaN(settlementRate) || settlementRate < 0 || settlementRate > 100) {
    return { error: '国际结算手续费比例必须是 0-100 之间的数字' }
  }
  if (isNaN(packingJpy) || packingJpy < 0) {
    return { error: '包装费必须是大于等于 0 的数字' }
  }

  const db = createServiceClient()
  const { error } = await db.from('settings').upsert({
    id: 'fees',
    content: JSON.stringify({
      serviceRate: serviceRate / 100,
      packingJpy,
      settlementRate: settlementRate / 100,
    }),
    updated_at: new Date().toISOString(),
  })
  if (error) return { error: '保存失败：' + error.message }
  revalidatePath('/admin/products')
  revalidatePath('/')
  return { success: true }
}
