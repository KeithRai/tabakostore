'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { confirmReceipt } from '@/app/orders/actions'
import { useLang } from './lang-provider'

// 确认收货按钮（仅已发货订单显示）
export default function ConfirmReceiptButton({
  orderId,
}: {
  orderId: string
}) {
  const { t } = useLang()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function onClick() {
    setBusy(true)
    setMsg('')
    const res = await confirmReceipt(orderId)
    setBusy(false)
    if (res?.error) {
      setMsg(res.error)
      return
    }
    setMsg('✅ ' + t('receiptConfirmed'))
    router.refresh()
  }

  return (
    <div style={{ marginTop: 10 }}>
      <button
        className="btn btn-primary btn-sm"
        type="button"
        onClick={onClick}
        disabled={busy}
      >
        {busy ? '…' : t('confirmReceipt')}
      </button>
      {msg ? <p className="muted">{msg}</p> : null}
    </div>
  )
}
