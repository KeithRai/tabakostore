'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type WishItem = {
  id: string
  name: string
  price: number
  image_url: string | null
}

type WishlistCtx = {
  items: WishItem[]
  has: (id: string) => boolean
  toggle: (item: WishItem) => void
  remove: (id: string) => void
  ready: boolean
}

const WishlistContext = createContext<WishlistCtx>({
  items: [],
  has: () => false,
  toggle: () => {},
  remove: () => {},
  ready: false,
})

const KEY = 'tabako-wishlist'

// 收藏夹（保存在本机浏览器，未登录也能用）
export function WishlistProvider({
  children,
}: {
  children: ReactNode
}) {
  const [items, setItems] = useState<WishItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(KEY) || '[]'))
    } catch {
      setItems([])
    }
    setReady(true)
  }, [])

  const save = useCallback((next: WishItem[]) => {
    setItems(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
      window.dispatchEvent(new Event('tabako-wishlist-updated'))
    } catch {
      // 存储失败忽略
    }
  }, [])

  const toggle = useCallback(
    (item: WishItem) => {
      const exists = items.some((i) => i.id === item.id)
      save(
        exists
          ? items.filter((i) => i.id !== item.id)
          : [item, ...items]
      )
    },
    [items, save]
  )

  const remove = useCallback(
    (id: string) => {
      save(items.filter((i) => i.id !== id))
    },
    [items, save]
  )

  return (
    <WishlistContext.Provider
      value={{
        items,
        has: (id: string) => items.some((i) => i.id === id),
        toggle,
        remove,
        ready,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistCtx {
  return useContext(WishlistContext)
}
