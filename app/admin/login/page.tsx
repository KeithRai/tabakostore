'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin } from '../actions'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await adminLogin(password)
    setBusy(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h1>管理后台登录</h1>
      <div className="field">
        <label className="label">管理密码</label>
        <input
          className="input"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? <div className="alert">{error}</div> : null}
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? '登录中…' : '登录'}
      </button>
    </form>
  )
}
