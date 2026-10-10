'use client'

// 返回顶部按钮：
// - 显示 "Top" 字样和向上箭头
// - 固定在右下角、客服聊天悬浮球正上方并居中对齐
export default function BackToTop() {
  return (
    <button
      type="button"
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <span className="back-to-top-text">Top</span>
      <span className="back-to-top-arrow">↑</span>
    </button>
  )
}
