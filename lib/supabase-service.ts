import { createClient } from '@supabase/supabase-js'

// 服务端客户端：使用 service_role key，绕过行级安全策略（RLS）。
// 只能用于你自己的服务器代码中，绝对不能暴露给浏览器。
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
