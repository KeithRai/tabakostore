// 货币转换：人民币（CNY）和日元（JPY）
// 数据库价格以美元为基准，展示时按实时汇率换算

export type Rates = { CNY: number; JPY: number }

// 默认汇率（汇率接口失败时的兜底值）
export const DEFAULT_RATES: Rates = { CNY: 7.2, JPY: 155 }

// 免费汇率接口（每小时缓存一次）
const RATES_API = 'https://open.er-api.com/v6/latest/USD'

// 服务端获取实时汇率（失败时返回默认汇率）
// 每 24 小时更新一次（每日锁定汇率）
export async function getRates(): Promise<Rates> {
  try {
    const res = await fetch(RATES_API, {
      next: { revalidate: 24 * 3600 },
    })
    if (!res.ok) return { ...DEFAULT_RATES }
    const data = await res.json()
    const cny = data?.rates?.CNY
    const jpy = data?.rates?.JPY
    if (
      typeof cny === 'number' &&
      cny > 0 &&
      typeof jpy === 'number' &&
      jpy > 0
    ) {
      return { CNY: cny, JPY: jpy }
    }
  } catch {
    // 网络失败时使用默认汇率
  }
  return { ...DEFAULT_RATES }
}

// 人民币（保留 2 位小数）
export function formatCNY(usd: number, rates: Rates): string {
  const v = (isNaN(usd) ? 0 : usd) * rates.CNY
  return `¥${v.toFixed(2)}`
}

// 日元（无小数位，千分位分隔）
export function formatJPY(usd: number, rates: Rates): string {
  const v = Math.round((isNaN(usd) ? 0 : usd) * rates.JPY)
  return `JP¥${v.toLocaleString('en-US')}`
}
