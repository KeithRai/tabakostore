'use client'

import { useLang } from './lang-provider'
import { usd } from '@/lib/format'
import { openChat } from './navbar'

// 下单成功后的"联系客服支付"弹窗
export default function PaymentModal({
  orderNo,
  total,
  onClose,
}: {
  orderNo: string
  total: number
  onClose: () => void
}) {
  const { t } = useLang()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t('orderPlaced')}</h2>
        <div className="modal-row">
          <span>{t('orderNumber')}</span>
          <strong>{orderNo}</strong>
        </div>
        <div className="modal-row">
          <span>{t('total')}</span>
          <strong>{usd(total)}</strong>
        </div>
        <h3>{t('howToPay')}</h3>
        <ol>
          <li>{t('howToPay1')}</li>
          <li>{t('howToPay2')}</li>
          <li>{t('howToPay3')}</li>
          <li>{t('howToPay4')}</li>
        </ol>
        <p className="muted">{t('cardComingSoon')}</p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={openChat}>
            {t('openChat')}
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
