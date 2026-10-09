export function usd(n: string | number): string {
  const v = typeof n === 'string' ? parseFloat(n) : n
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(isNaN(v) ? 0 : v)
}

export type LangKey = 'en' | 'zh' | 'ja'

export const ORDER_STATUS: Record<string, string> = {
  pending: 'Pending payment',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_ZH: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  delivered: '已完成',
  cancelled: '已取消',
}

export const ORDER_STATUS_JA: Record<string, string> = {
  pending: '入金待ち',
  paid: '入金済み',
  shipped: '発送済み',
  delivered: '完了',
  cancelled: 'キャンセル',
}

export function orderStatusLabel(
  status: string,
  lang: LangKey
): string {
  if (lang === 'zh') return ORDER_STATUS_ZH[status] ?? status
  if (lang === 'ja') return ORDER_STATUS_JA[status] ?? status
  return ORDER_STATUS[status] ?? status
}
