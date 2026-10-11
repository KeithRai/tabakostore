'use client'

import { FormEvent, useState } from 'react'
import { updateInstructions } from '../actions'

// 后台帮助信息编辑（内容显示在"帮助"页面）
export default function InstructionsClient({
  initialContent,
}: {
  initialContent: string
}) {
  const [content, setContent] = useState(initialContent)
  // 已保存的内容（用于预览）
  const [savedContent, setSavedContent] = useState(initialContent)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('content', content)
    setBusy(true)
    setMsg('')
    const res = await updateInstructions(fd)
    setBusy(false)
    if (res?.error) {
      setMsg('❌ ' + res.error)
    } else {
      setMsg('✅ 保存成功')
      setSavedContent(content)
    }
  }

  return (
    <div>
      <h1>帮助信息编辑</h1>
      <p className="muted">
        在这里填写展示在"帮助"页面的说明内容（例如：付款方式、发货时间、退换政策等）。
      </p>

      {/* 当前已保存的信息（帮助页面实际展示的内容） */}
      {savedContent ? (
        <div className="admin-panel">
          <h3 style={{ marginTop: 0 }}>当前帮助页展示内容</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{savedContent}</p>
        </div>
      ) : null}

      <form className="form" onSubmit={onSubmit}>
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
              setContent(initialContent)
              setMsg('')
            }}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
