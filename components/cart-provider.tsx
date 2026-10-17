'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useLang } from './lang-provider'
import { MAX_ORDER, MAX_PER_ITEM } from '@/lib/constants'
import type { CartItem } from '@/lib/types'

type CartContextType = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number, variantKey?: string) => void
  clear: () => void
  // 用最新库存同步购物车（数量超过库存时自动下调）
  updateStocks: (stocks: Record<string, number>) => void
  count: number
  total: number
}

const CartContext = createContext<CartContextType | null>(null)
const STORAGE_KEY = 'tabako-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const { t } = useLang()
  const [items, setItems] = useState<CartItem[]>([])

  // 启动时从 localStorage 读取购物车
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
    } catch {
      setItems([])
    }
  }, [])

  // 每次变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // 加入购物车：数量不能超过库存、单件上限 20、整单合计上限 20
  const add = (item: Omit<CartItem, 'qty'>, qty = 1) => {
    const currentTotal = items.reduce((s, i) => s + i.qty, 0)
    // 同一商品不同规格分开计数
    const key = item.variantKey ?? ''
    const found = items.find(
      (i) => i.id === item.id && (i.variantKey ?? '') === key
    )
    const currentQty = found ? found.qty : 0
    const otherTotal = currentTotal - currentQty

    // 库存上限：以最新传入的库存为准
    const stock =
      typeof item.stock === 'number' ? item.stock : found?.stock
    const stockCap =
      typeof stock === 'number' && stock >= 0 ? stock : MAX_PER_ITEM
    // 综合上限：库存、单件上限、整单剩余额度
    const maxForThisItem = Math.min(
      stockCap,
      MAX_PER_ITEM,
      MAX_ORDER - otherTotal
    )

    if (maxForThisItem <= 0) {
      // 库存为 0 或整单额度已用完
      alert(
        stockCap <= 0
          ? t('outOfStock')
          : t('maxOrderReached', { n: MAX_ORDER })
      )
      return
    }

    const wanted = currentQty + qty
    const newQty = Math.min(wanted, maxForThisItem)

    // 超过上限时给出明确提示
    if (newQty < wanted) {
      const leftStock = stockCap - currentQty
      const leftOrder = MAX_ORDER - otherTotal - currentQty
      if (leftOrder <= 0) {
        alert(t('maxOrderReached', { n: MAX_ORDER }))
      } else if (leftStock <= 0) {
        alert(t('outOfStock'))
      } else {
        alert(t('stockReached', { n: leftStock }))
      }
    }

    setItems((prev) => {
      const exists = prev.find(
        (i) => i.id === item.id && (i.variantKey ?? '') === key
      )
      if (exists) {
        return prev.map((i) =>
          i.id === item.id && (i.variantKey ?? '') === key
            ? {
                ...i,
                qty: newQty,
                stock: typeof stock === 'number' ? stock : i.stock,
              }
            : i
        )
      }
      return [...prev, { ...item, qty: newQty }]
    })
  }

  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id))

  // 修改数量：受库存、单件 20、整单 20 共同约束
  const setQty = (id: string, qty: number, variantKey = '') => {
    const currentTotal = items.reduce((s, i) => s + i.qty, 0)
    const found = items.find(
      (i) => i.id === id && (i.variantKey ?? '') === variantKey
    )
    if (!found) return
    const otherTotal = currentTotal - found.qty
    const stockCap =
      typeof found.stock === 'number' && found.stock >= 0
        ? found.stock
        : MAX_PER_ITEM
    const capped = Math.max(
      1,
      Math.min(qty, stockCap, MAX_PER_ITEM, MAX_ORDER - otherTotal)
    )
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && (i.variantKey ?? '') === variantKey
          ? { ...i, qty: capped }
          : i
      )
    )
  }

  // 同步最新库存：数量超过库存时自动下调（旧购物车也能修正）
  const updateStocks = useCallback(
    (stocks: Record<string, number>) => {
      setItems((prev) =>
        prev.map((i) => {
          const stock = stocks[i.id]
          if (typeof stock !== 'number') return i
          const max = Math.max(1, Math.min(stock, MAX_PER_ITEM))
          if (i.stock === stock && i.qty <= max) return i
          return { ...i, stock, qty: Math.min(i.qty, max) }
        })
      )
    },
    []
  )

  const clear = () => setItems([])
  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        remove,
        setQty,
        clear,
        updateStocks,
        count,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
