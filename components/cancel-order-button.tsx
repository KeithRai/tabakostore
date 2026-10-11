'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from './lang-provider'
import { cancelOrder } from '@/app/orders/actions'

// 取消订单按钮（仅待支付订单显示）
export default function CancelOrderButton({
  orderId,
}: {
  orderId: string
}) {
  const router = useRouter()
  const { t } = useLang()
  const [busy, setBusy] = useState(false)

  async function onClick() {
    if (!confirm(t('cancelConfirm'))) return
    setBusy(true)
    const res = await cancelOrder(orderId)
    setBusy(false)
    if (res?.error) {
      alert('❌ ' + res.error)
    } else {
      alert('✅ ' + t('orderCancelled'))
      router.refresh()
    }
  }

  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      onClick={onClick}
      disabled={busy}
    >
      {busy ? '…' : t('cancelOrder')}
    </button>
  )
}
