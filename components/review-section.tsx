'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/components/lang-provider'
import { createClient } from '@/lib/supabase-browser'
import { addReview, deleteReview } from '@/app/product/[id]/actions'

export type ReviewItem = {
  id: string
  user_id: string
  nickname: string | null
  rating: number
  content: string
  created_at: string
}

// 星级星星（只读显示）
function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-label={String(value)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? 'star on' : 'star'}>
          ★
        </span>
      ))}
    </span>
  )
}

// 商品评价：平均分 + 评价列表 + 发表评价（每个用户限一次）
export default function ReviewSection({
  productId,
  initialReviews,
}: {
  productId: string
  initialReviews: ReviewItem[]
}) {
  const { t } = useLang()
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews)
  const [userId, setUserId] = useState<string>('')
  const [nickname, setNickname] = useState<string>('')
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  // 当前登录用户
  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        const user = data.session?.user
        setUserId(user?.id ?? '')
        setNickname(
          String(
            (user?.user_metadata ?? {}).nickname ??
              user?.email?.split('@')[0] ??
              'User'
          )
        )
      })
      .catch(() => {})
  }, [])

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0
  const mine = userId
    ? reviews.find((r) => r.user_id === userId)
    : undefined

  async function onSubmit() {
    if (rating < 1 || rating > 5 || !content.trim()) {
      setMsg(t('reviewError'))
      return
    }
    setBusy(true)
    setMsg('')
    const res = await addReview(productId, rating, content.trim())
    setBusy(false)
    if (res?.error) {
      setMsg(res.error)
      return
    }
    // 乐观更新：把新评价插到最前面
    setReviews((prev) => [
      {
        id: 'tmp-' + Date.now(),
        user_id: userId,
        nickname,
        rating,
        content: content.trim(),
        created_at: new Date().toISOString(),
      },
      ...prev.filter((r) => r.user_id !== userId),
    ])
    setContent('')
    setRating(5)
    setMsg(t('reviewSubmitted'))
  }

  async function onDelete(reviewId: string) {
    if (!confirm(t('reviewConfirmDelete'))) return
    const res = await deleteReview(reviewId, productId)
    if (res?.error) {
      setMsg(res.error)
      return
    }
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    setMsg(t('reviewDeleted'))
  }

  return (
    <div className="review-section">
      <h2>{t('reviews')}</h2>

      {/* 评分概览 */}
      <div className="review-summary">
        <span className="review-avg">{avg ? avg.toFixed(1) : '—'}</span>
        <div>
          <Stars value={Math.round(avg)} />
          <p className="muted" style={{ margin: 0 }}>
            {t('avgRating')} · {reviews.length}{' '}
            {t('reviews')}
          </p>
        </div>
      </div>

      {/* 发表评价 */}
      {!userId ? (
        <p className="muted">
          <Link href="/login">{t('reviewLoginHint')}</Link>
        </p>
      ) : mine ? (
        <p className="muted">{t('reviewOnePerProduct')}</p>
      ) : (
        <div className="review-form">
          <div className="field">
            <label className="label">{t('yourRating')}</label>
            <div className="star-input">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  className={i <= rating ? 'star-btn on' : 'star-btn'}
                  onClick={() => setRating(i)}
                  aria-label={String(i)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="label">{t('reviewContent')}</label>
            <textarea
              className="input"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          {msg ? <p className="muted">{msg}</p> : null}
          <button
            className="btn btn-primary"
            type="button"
            onClick={onSubmit}
            disabled={busy}
          >
            {busy ? '…' : t('submitReview')}
          </button>
        </div>
      )}
      {/* 提交结果提示（表单收起后仍可见） */}
      {msg && mine ? <p className="muted">{msg}</p> : null}

      {/* 评价列表 */}
      <div className="review-list">
        {reviews.length === 0 ? (
          <p className="muted">{t('noReviews')}</p>
        ) : (
          reviews.map((r) => (
            <div className="review-item" key={r.id}>
              <div className="review-item-head">
                <strong>{r.nickname || 'User'}</strong>
                <Stars value={r.rating} />
                <span className="muted">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
                {r.user_id === userId ? (
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={() => onDelete(r.id)}
                  >
                    {t('delete')}
                  </button>
                ) : null}
              </div>
              <p style={{ margin: '6px 0 0' }}>{r.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
