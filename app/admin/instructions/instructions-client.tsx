'use client'

import { FormEvent, useState } from 'react'
import { updateInstructions } from '../actions'

// 商家说明编辑（内容显示在"帮助"页面）
export default function InstructionsClient({
  initialContent,
}: {
  initialContent: string
}) {
  const [content, setContent] = useState(initialContent)
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
    }
  }

  return (
    <div>
      <h1>说明</h1>
      <p className="muted">
        在这里填写展示在"帮助"页面的说明内容（例如：付款方式、发货时间、退换政策等）。
      </p>
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
        <button
          className="btn btn-primary"
          type="submit"
          disabled={busy}
          style={{ marginTop: 12 }}
        >
          {busy ? '保存中…' : '保存'}
        </button>
      </form>
    </div>
  )
}
