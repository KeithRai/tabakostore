'use client'

import { FormEvent, useState } from 'react'
import { updateInstructions } from '../actions'

// 后台帮助信息编辑（内容显示在"帮助"页面）
// 编辑栏含标题；下方展示当前已保存的内容，并可编辑/删除
export default function InstructionsClient({
  initialTitle,
  initialContent,
}: {
  initialTitle: string
  initialContent: string
}) {
  // 编辑栏
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  // 当前已保存的展示内容
  const [saved, setSaved] = useState({
    title: initialTitle,
    body: initialContent,
  })
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('title', title)
    fd.set('content', content)
    setBusy(true)
    setMsg('')
    const res = await updateInstructions(fd)
    setBusy(false)
    if (res?.error) {
      setMsg('❌ ' + res.error)
    } else {
      setMsg('✅ 保存成功')
      setSaved({ title, body: content })
    }
  }

  // 编辑当前展示内容：载入到编辑栏
  function onEditSaved() {
    setTitle(saved.title)
    setContent(saved.body)
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 删除当前展示内容
  async function onDeleteSaved() {
    if (!confirm('确定删除当前展示的帮助信息吗？')) return
    const fd = new FormData()
    fd.set('title', '')
    fd.set('content', '')
    setBusy(true)
    setMsg('')
    const res = await updateInstructions(fd)
    setBusy(false)
    if (res?.error) {
      setMsg('❌ ' + res.error)
    } else {
      setMsg('✅ 已删除')
      setSaved({ title: '', body: '' })
      setTitle('')
      setContent('')
    }
  }

  return (
    <div>
      <h1>帮助信息编辑</h1>
      <p className="muted">
        在这里编辑展示在"帮助"页面的说明内容。
      </p>

      {/* 编辑栏（含标题） */}
      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label className="label">标题</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：付款与发货说明"
          />
        </div>
        <div className="field">
          <label className="label">说明内容</label>
          <textarea
            className="input"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        {msg ? <p className="muted">{msg}</p> : null}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy}
          >
            {busy ? '保存中…' : '保存'}
          </button>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => {
              setTitle(initialTitle)
              setContent(initialContent)
              setMsg('')
            }}
          >
            取消
          </button>
        </div>
      </form>

      {/* 当前帮助页展示内容（在说明栏下方） */}
      <h2 style={{ marginTop: 24 }}>当前帮助页展示内容</h2>
      <div className="admin-panel">
        {saved.title ? (
          <h3 style={{ marginTop: 0 }}>{saved.title}</h3>
        ) : null}
        {saved.body ? (
          <p style={{ whiteSpace: 'pre-wrap' }}>{saved.body}</p>
        ) : (
          <p className="muted">暂无展示内容</p>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={onEditSaved}
          >
            编辑
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={onDeleteSaved}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}
