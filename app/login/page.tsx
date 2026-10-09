'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { useLang } from '@/components/lang-provider'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const { t } = useLang()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    })
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push(next)
    router.refresh()
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h1>{t('loginTitle')}</h1>
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
        <label className="label">{t('password')}</label>
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
        {busy ? t('loggingIn') : t('logIn')}
      </button>
      <p className="muted">
        {t('noAccount')} <Link href="/signup">{t('signUp')}</Link>
      </p>
    </form>
  )
}
