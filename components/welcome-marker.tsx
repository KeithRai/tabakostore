'use client'

import { useEffect } from 'react'

// 首次访问标记：看过欢迎语后写入 cookie，之后不再显示欢迎语
export default function WelcomeMarker() {
  useEffect(() => {
    document.cookie =
      'welcomed=1; path=/; max-age=31536000; samesite=lax'
  }, [])
  return null
}
