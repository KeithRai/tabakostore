'use client'

import { FormEvent, useState } from 'react'
import { updateInstructions } from '../actions'
import { useLang } from '@/components/lang-provider'

// 后台帮助信息编辑（内容显示在"帮助"页面）
// 编辑栏含标题；下方展示当前已保存的内容，并可编辑/删除
export default function InstructionsClient({
  initialTitle,
  initialContent,
}: {
  initialTitle: string
  initialContent: string
}) {
  const { t } = useLang()
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
      setMsg('✅ ' + t('admSaved'))
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
    if (!confirm(t('admDeleteInstructionsConfirm'))) return
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
      setMsg('✅ ' + t('admDeletedMsg'))
      setSaved({ title: '', body: '' })
      setTitle('')
      setContent('')
    }
  }

  return (
    <div>
      <h1>{t('admInstructions')}</h1>
      <p className="muted">{t('admInstructionsDesc')}</p>

      {/* 编辑栏（含标题） */}
      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label className="label">{t('admInstructionsTitle')}</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('admInstructionsPlaceholder')}
          />
        </div>
        <div className="field">
          <label className="label">{t('admInstructionsBody')}</label>
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
            {busy ? t('admSaving') : t('save')}
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
            {t('cancel')}
          </button>
        </div>
      </form>

      {/* 当前帮助页展示内容（在说明栏下方） */}
      <h2 style={{ marginTop: 24 }}>{t('admCurrentDisplay')}</h2>
      <div className="admin-panel">
        {saved.title ? (
          <h3 style={{ marginTop: 0 }}>{saved.title}</h3>
        ) : null}
        {saved.body ? (
          <p style={{ whiteSpace: 'pre-wrap' }}>{saved.body}</p>
        ) : (
          <p className="muted">{t('admNoDisplayContent')}</p>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={onEditSaved}
          >
            {t('edit')}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={onDeleteSaved}
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
