'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
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

  const add = (item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id)
      if (found) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: Math.min(i.qty + qty, 99) } : i
        )
      }
      return [...prev, { ...item, qty }]
    })
  }

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i
      )
    )

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
