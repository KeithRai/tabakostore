'use client'

import { useEffect } from 'react'
import { addHistory } from './history-section'

// 商品详情页：记录浏览历史（本地保存，不上传服务器）
export default function HistoryTracker({
  id,
  name,
  price,
  imageUrl,
}: {
  id: string
  name: string
  price: number
  imageUrl: string | null
}) {
  useEffect(() => {
    addHistory({ id, name, price, image_url: imageUrl })
  }, [id, name, price, imageUrl])

  return null
}
