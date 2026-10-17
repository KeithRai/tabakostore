import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'
import type { Product } from '@/lib/types'

// 按 ID 批量读取商品（收藏夹页面使用）
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get('ids') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50)

  if (ids.length === 0) {
    return NextResponse.json([] as Product[])
  }

  const db = createServiceClient()
  const { data } = await db
    .from('products')
    .select('*')
    .in('id', ids)

  return NextResponse.json((data ?? []) as Product[])
}
