import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { getRates, formatCNY, formatJPY } from '@/lib/currency'
import { orderStatusLabel } from '@/lib/format'
import { getDictionary, tr, LANG_LIST, type Lang } from '@/lib/i18n'
import ProfileClient from './profile-client'
import type { Order } from '@/lib/types'

// 用户个人资料页（需登录）+ 过往订单
export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile')

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>

  // 语言
  const cookieStore = await cookies()
  const rawLang = cookieStore.get('lang')?.value
  const lang: Lang = LANG_LIST.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : 'en'
  const dict = getDictionary(lang)

  // 实时汇率
  const rates = await getRates()

  // 过往订单
  const db = createServiceClient()
  const { data } = await db
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  const orders = (data ?? []) as Order[]

  return (
    <div>
      <ProfileClient
        email={user.email ?? ''}
        nickname={String(meta.nickname ?? '')}
        gender={String(meta.gender ?? '')}
        birthday={String(meta.birthday ?? '')}
        address={String(meta.address ?? '')}
        phone={String(meta.phone ?? '')}
        avatarUrl={String(meta.avatar_url ?? '')}
      />

      {/* 过往订单 */}
      <h2 style={{ marginTop: 32 }}>
        {tr(dict, 'pastOrders')}
      </h2>
      {orders.length === 0 ? (
        <div className="admin-panel">
          <p>{tr(dict, 'noOrders')}</p>
        </div>
      ) : (
        <>
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-head">
                <strong>{order.order_no}</strong>
                <span className={`status-pill ${order.status}`}>
                  {orderStatusLabel(order.status, lang)}
                </span>
              </div>
              <div className="muted">
                {new Date(order.created_at).toLocaleString()} ·{' '}
                {tr(dict, 'total')}:{' '}
                {formatCNY(parseFloat(order.total), rates)} /{' '}
                {formatJPY(parseFloat(order.total), rates)}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link className="btn btn-outline btn-sm" href="/orders">
              {tr(dict, 'viewAll')} →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
