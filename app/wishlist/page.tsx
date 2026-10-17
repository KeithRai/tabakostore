import WishlistClient from './wishlist-client'
import { buildMetadata } from '@/lib/seo'

// SEO
export function generateMetadata() {
  return buildMetadata('wishlist')
}

// 收藏夹页面
export default function WishlistPage() {
  return <WishlistClient />
}
