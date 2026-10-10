'use client'

import {
  createContext,
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
  setQty: (id: string, qty: number) => void
  clear: () => void
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

  // 加入购物车：单件上限 20，整单合计上限 20
  const add = (item: Omit<CartItem, 'qty'>, qty = 1) => {
    const currentTotal = items.reduce((s, i) => s + i.qty, 0)
    const found = items.find((i) => i.id === item.id)
    const currentQty = found ? found.qty : 0
    // 该商品最多还能加几件（受单件上限和整单上限约束）
    const maxForThisItem = Math.min(
      MAX_PER_ITEM,
      MAX_ORDER - (currentTotal - currentQty)
    )
    if (maxForThisItem <= 0) {
      alert(t('maxOrderReached', { n: MAX_ORDER }))
      return
    }
    const newQty = Math.min(currentQty + qty, maxForThisItem)
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      if (exists) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: newQty } : i))
      }
      return [...prev, { ...item, qty: newQty }]
    })
  }

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  // 修改数量：同样受单件 20 和整单 20 约束
  const setQty = (id: string, qty: number) => {
    const currentTotal = items.reduce((s, i) => s + i.qty, 0)
    const found = items.find((i) => i.id === id)
    const otherTotal = currentTotal - (found ? found.qty : 0)
    const capped = Math.max(1, Math.min(qty, MAX_PER_ITEM, MAX_ORDER - otherTotal))
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: capped } : i))
    )
  }

  const clear = () => setItems([])
  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
