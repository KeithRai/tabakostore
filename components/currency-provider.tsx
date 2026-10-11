'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_RATES,
  formatCNY,
  formatJPY,
  type Rates,
} from '@/lib/currency'

type CurrencyCtx = {
  rates: Rates
  cny: (usd: number) => string
  jpy: (usd: number) => string
}

const CurrencyContext = createContext<CurrencyCtx>({
  rates: DEFAULT_RATES,
  cny: (u) => formatCNY(u, DEFAULT_RATES),
  jpy: (u) => formatJPY(u, DEFAULT_RATES),
})

// 客户端汇率提供者：每日锁定汇率（当天内使用同一汇率）
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES)

  useEffect(() => {
    try {
      // 今日汇率已缓存时直接使用（每日锁定）
      const cacheKey = 'tabako_rates'
      const today = new Date().toDateString()
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        const cachedRates = parsed?.rates
        const cny = cachedRates?.CNY
        const jpy = cachedRates?.JPY
        if (
          parsed?.date === today &&
          typeof cny === 'number' &&
          cny > 0 &&
          typeof jpy === 'number' &&
          jpy > 0
        ) {
          setRates({ CNY: cny, JPY: jpy })
          return
        }
      }
    } catch {
      // 缓存读取失败时继续请求
    }
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((data) => {
        const cny = data?.rates?.CNY
        const jpy = data?.rates?.JPY
        if (
          typeof cny === 'number' &&
          cny > 0 &&
          typeof jpy === 'number' &&
          jpy > 0
        ) {
          setRates({ CNY: cny, JPY: jpy })
          try {
            // 缓存今日汇率
            localStorage.setItem(
              'tabako_rates',
              JSON.stringify({
                date: new Date().toDateString(),
                rates: { CNY: cny, JPY: jpy },
              })
            )
          } catch {
            // 缓存写入失败不影响显示
          }
        }
      })
      .catch(() => {})
  }, [])

  return (
    <CurrencyContext.Provider
      value={{
        rates,
        cny: (u) => formatCNY(u, rates),
        jpy: (u) => formatJPY(u, rates),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
