'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { useLang } from '@/components/lang-provider'

type GenderOption = '' | 'male' | 'female' | 'other'

export default function SignupPage() {
  const router = useRouter()
  const { t } = useLang()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [gender, setGender] = useState<GenderOption>('')
  const [birthday, setBirthday] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()

    // 必填校验：昵称、同意协议
    if (!nickname.trim()) {
      setError(t('nicknameRequired'))
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!agree) {
      setError(t('termsRequired'))
      return
    }

    setBusy(true)
    setError('')
    setMessage('')

    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname: nickname.trim(),
          gender,
          birthday,
        },
      },
    })
    if (error) {
      setBusy(false)
      setError(error.message)
      return
    }

    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // 上传头像（如果选了文件）
    if (session?.user && avatarFile) {
      const ext = avatarFile.name.split('.').pop() || 'jpg'
      const path = `${session.user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, {
          contentType: avatarFile.type || 'image/jpeg',
        })
      if (!uploadError) {
        await supabase.auth.updateUser({
          data: {
            avatar_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`,
          },
        })
      }
    }

    setBusy(false)

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
      <div className="field">
        <label className="label">
          {t('nickname')} *
        </label>
        <input
          className="input"
          required
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="例如：ToyLover"
        />
      </div>
      <div className="field">
        <label className="label">{t('avatar')}</label>
        <input
          className="file-input"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
        />
        {avatarFile ? (
          <p className="muted">已选择：{avatarFile.name}</p>
        ) : null}
      </div>
      <div className="field">
        <label className="label">{t('gender')}</label>
        <select
          className="input"
          value={gender}
          onChange={(e) => setGender(e.target.value as GenderOption)}
        >
          <option value="">—</option>
          <option value="male">{t('male')}</option>
          <option value="female">{t('female')}</option>
          <option value="other">{t('other')}</option>
        </select>
      </div>
      <div className="field">
        <label className="label">{t('birthday')}</label>
        <input
          className="input"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />
      </div>
      <div className="checkbox-field">
        <input
          type="checkbox"
          id="agree"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <label htmlFor="agree">{t('agreeTerms')} *</label>
      </div>
      {error ? <div className="alert">{error}</div> : null}
      {message ? <p className="muted">{message}</p> : null}
      <button
        className="btn btn-primary"
        type="submit"
        disabled={busy}
        style={{ marginTop: 12 }}
      >
        {busy ? t('signingUp') : t('signUp')}
      </button>
      <p className="muted">
        {t('haveAccount')} <Link href="/login">{t('logIn')}</Link>
      </p>
    </form>
  )
}
