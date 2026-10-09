'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { useLang } from '@/components/lang-provider'

export default function SignupPage() {
  const router = useRouter()
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    setError('')
    setMessage('')
    const { error } = await createClient().auth.signUp({
      email,
      password,
    })
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    // 如果站点关闭了"邮箱验证"，注册后直接登录成功
    const {
      data: { session },
    } = await createClient().auth.getSession()
    if (session) {
      router.push('/')
      router.refresh()
    } else {
      setMessage(t('checkEmail'))
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h1>{t('signupTitle')}</h1>
      <div className="field">
        <label className="label">{t('email')}</label>
        <input
          className="input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="label">{t('passwordMin')}</label>
        <input
          className="input"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? <div className="alert">{error}</div> : null}
      {message ? <p className="muted">{message}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? t('signingUp') : t('signUp')}
      </button>
      <p className="muted">
        {t('haveAccount')} <Link href="/login">{t('logIn')}</Link>
      </p>
    </form>
  )
}
