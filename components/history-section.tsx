'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/components/lang-provider'
import { useCurrency } from '@/components/currency-provider'

export type HistoryItem = {
  id: string
  name: string
  price: number
  image_url: string | null
}

const KEY = 'tabako-history'
const MAX = 8

// 浏览历史：本地记录最近浏览过的商品
export function addHistory(item: HistoryItem) {
  try {
    const list: HistoryItem[] = JSON.parse(
      localStorage.getItem(KEY) || '[]'
    )
    const next = [item, ...list.filter((i) => i.id !== item.id)].slice(
      0,
      MAX
    )
    localStorage.setItem(KEY, JSON.stringify(next))
    window.dispatchEvent(new Event('tabako-history-updated'))
  } catch {
    // 存储失败忽略
  }
}

// 最近浏览区块（首页展示）
export default function HistorySection() {
  const { t } = useLang()
  const { cny } = useCurrency()
  const [items, setItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    function load() {
      try {
        setItems(
          JSON.parse(localStorage.getItem(KEY) || '[]') as HistoryItem[]
        )
      } catch {
        setItems([])
      }
    }
    load()
    window.addEventListener('tabako-history-updated', load)
    return () =>
      window.removeEventListener('tabako-history-updated', load)
  }, [])

  if (items.length === 0) return null

  return (
    <div style={{ marginTop: 28 }}>
      <h2>{t('recentlyViewed')}</h2>
      <div className="grid">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            className="history-item"
          >
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                width={80}
                height={80}
              />
            ) : null}
            <div className="history-info">
              <div className="history-name">{item.name}</div>
              <div className="price" style={{ fontSize: 14 }}>
                {cny(item.price)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
