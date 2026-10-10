'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-service'
import { sha256, adminToken, requireAdmin } from '@/lib/admin-auth'

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
  const price = parseFloat(String(formData.get('price') ?? ''))
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

  if (!name || isNaN(price) || isNaN(stock) || stock < 0) {
    return { error: '请填写完整信息：名称必填，价格和库存必须是数字' }
  }

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

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin()
  const db = createServiceClient()
  const { error } = await db.from('orders').update({ status }).eq('id', id)
  if (error) return { error: '更新失败：' + error.message }
  revalidatePath('/admin/orders')
  revalidatePath('/orders', 'page')
  return { success: true }
}

// 新闻：新增或编辑
export async function upsertNews(formData: FormData) {
  await requireAdmin()
  const db = createServiceClient()
  const id = String(formData.get('id') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!title) {
    return { error: '请填写新闻标题' }
  }

  if (id) {
    const { error } = await db
      .from('news')
      .update({ title, content })
      .eq('id', id)
    if (error) return { error: '保存失败：' + error.message }
  } else {
    const { error } = await db.from('news').insert({ title, content })
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
