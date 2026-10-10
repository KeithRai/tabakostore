'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

// 获取当前登录状态（客户端组件用）
export function useCurrentUser(): {
  loading: boolean
  isLoggedIn: boolean
} {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  return { loading, isLoggedIn }
}
