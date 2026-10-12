'use client'

import { FormEvent, useEffect, useState } from 'react'
import { getFees, saveFees } from '../actions'
import { DEFAULT_FEES } from '@/lib/constants'
import { useLang } from '@/components/lang-provider'
import type { FeeSettings } from '@/lib/types'

// 费用设置：服务费 / 包装费 / 国际结算手续费
// 运费不固定：下单后由客服确认实际运费
export default function FeesClient() {
  const { t } = useLang()
  const [fees, setFees] = useState<FeeSettings>(DEFAULT_FEES)
  const [feeRate, setFeeRate] = useState('10')
  const [feePacking, setFeePacking] = useState('300')
  const [feeSettlement, setFeeSettlement] = useState('2')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  // 读取当前费用设置
  useEffect(() => {
    getFees()
      .then((f) => {
        setFees(f)
        setFeeRate(String(Math.round(f.serviceRate * 100)))
        setFeePacking(String(f.packingJpy))
        setFeeSettlement(String(Math.round(f.settlementRate * 100)))
      })
      .catch(() => {})
  }, [])

  function reset() {
    setFeeRate(String(Math.round(fees.serviceRate * 100)))
    setFeePacking(String(fees.packingJpy))
    setFeeSettlement(
      String(Math.round(fees.settlementRate * 100))
    )
    setMsg('')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('serviceRate', feeRate)
    fd.set('packingJpy', feePacking)
    fd.set('settlementRate', feeSettlement)
    setBusy(true)
    setMsg('')
    const res = await saveFees(fd)
    setBusy(false)
    if (res?.error) {
      setMsg('❌ ' + res.error)
    } else {
      setMsg('✅ ' + t('admSaved'))
      const f = await getFees()
      setFees(f)
    }
  }

  return (
    <div>
      <h1>{t('admFees')}</h1>
      <p className="muted">{t('admFeeDesc')}</p>
      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label className="label">{t('admServiceFee')}</label>
          <input
            className="input"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
          />
          <p className="muted">{t('admPercentOfGoods')}</p>
        </div>
        <div className="field">
          <label className="label">{t('admPackingFee')}</label>
          <input
            className="input"
            type="number"
            min="0"
            step="1"
            value={feePacking}
            onChange={(e) => setFeePacking(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="label">{t('admSettlementFee')}</label>
          <input
            className="input"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={feeSettlement}
            onChange={(e) => setFeeSettlement(e.target.value)}
          />
          <p className="muted">{t('admPercentOfGoods')}</p>
        </div>
        <div className="field">
          <label className="label">Shipping</label>
          <p className="muted">{t('admShippingNote')}</p>
        </div>
        {msg ? <p className="muted">{msg}</p> : null}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy}
          >
            {busy ? t('admSaving') : t('save')}
          </button>
          <button
            className="btn btn-outline"
            type="button"
            onClick={reset}
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
