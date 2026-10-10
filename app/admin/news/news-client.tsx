'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertNews, deleteNews } from '../actions'
import type { News } from '@/lib/types'

// 新闻管理：添加/编辑/删除新闻
export default function NewsClient({ news }: { news: News[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState('')

  function startEdit(n: News) {
    setEditingId(n.id)
    setTitle(n.title)
    setContent(n.content ?? '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId('')
    setTitle('')
    setContent('')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('id', editingId)
    fd.set('title', title)
    fd.set('content', content)
    const res = await upsertNews(fd)
    if (res?.error) {
      setMsg('❌ ' + res.error)
    } else {
      setMsg('✅ 保存成功')
      resetForm()
      router.refresh()
    }
  }

  async function onDelete(id: string) {
    if (!confirm('确定删除这条新闻吗？')) return
    const res = await deleteNews(id)
    if (res?.error) {
      setMsg('❌ ' + res.error)
    } else {
      setMsg('✅ 已删除')
      router.refresh()
    }
  }

  return (
    <div>
      <div className="admin-bar">
        <h1>新闻管理</h1>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => {
            resetForm()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          ＋ 添加新闻
        </button>
      </div>

      <form className="admin-panel" onSubmit={onSubmit}>
        <h2 style={{ marginTop: 0 }}>
          {editingId ? '编辑新闻' : '添加新闻'}
        </h2>
        <div className="field">
          <label className="label">标题 *</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="label">内容</label>
          <textarea
            className="input"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        {msg ? <p className="muted">{msg}</p> : null}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn btn-primary" type="submit">
            保存
          </button>
          {editingId ? (
            <button
              className="btn btn-outline"
              type="button"
              onClick={resetForm}
            >
              取消编辑
            </button>
          ) : null}
        </div>
      </form>

      <h2>现有新闻（{news.length}）</h2>
      {news.length === 0 ? (
        <div className="empty">
          <p>还没有新闻。</p>
        </div>
      ) : (
        news.map((n) => (
          <div className="news-item" key={n.id}>
            <div className="order-head">
              <strong>{n.title}</strong>
              <span className="muted">
                {new Date(n.created_at).toLocaleString()}
              </span>
            </div>
            {n.content ? (
              <p style={{ marginTop: 6, fontSize: 14 }}>{n.content}</p>
            ) : null}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => startEdit(n)}
              >
                编辑
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(n.id)}
              >
                删除
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
