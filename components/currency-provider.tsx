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

// 客户端汇率提供者：页面加载后获取实时汇率
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES)

  useEffect(() => {
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
