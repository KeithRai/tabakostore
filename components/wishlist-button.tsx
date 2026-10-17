'use client'

import { useWishlist, type WishItem } from './wishlist-provider'
import { useLang } from './lang-provider'

// 收藏按钮（爱心图标，可放在商品卡片和详情页）
export default function WishlistButton({
  item,
  className = '',
}: {
  item: WishItem
  className?: string
}) {
  const { has, toggle, ready } = useWishlist()
  const { t } = useLang()
  if (!ready) return null
  const liked = has(item.id)
  const label = liked ? t('removeFromWishlist') : t('addToWishlist')

  return (
    <button
      type="button"
      className={`wish-btn ${className}`}
      title={label}
      aria-label={liked ? 'liked' : 'unliked'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(item)
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  )
}
