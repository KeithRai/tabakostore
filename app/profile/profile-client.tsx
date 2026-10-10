'use client'

import { FormEvent, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/lang-provider'
import { PHONE_CODES } from '@/lib/constants'
import { updateProfile } from './actions'

type GenderOption = '' | 'male' | 'female' | 'other'

export default function ProfileClient({
  email,
  nickname,
  gender,
  birthday,
  address,
  phone,
  avatarUrl,
}: {
  email: string
  nickname: string
  gender: string
  birthday: string
  address: string
  phone: string
  avatarUrl: string
}) {
  const { t } = useLang()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  // 解析已有手机号（分离区号和号码）
  const [phoneCode, setPhoneCode] = useState(() => {
    const match = phone.match(/^\+\d{1,4}/)
    return match ? match[0] : '+86'
  })
  const [phoneNum, setPhoneNum] = useState(() => {
    const match = phone.match(/^\+\d{1,4}\s*/)
    return match ? phone.slice(match[0].length) : phone
  })

  const [nick, setNick] = useState(nickname)
  const [gen, setGen] = useState<GenderOption>(gender as GenderOption)
  const [bday, setBday] = useState(birthday)
  const [addr, setAddr] = useState(address)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  function onPickAvatar(files: FileList | null) {
    const f = files?.[0] ?? null
    setFile(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  function onCancel() {
    setNick(nickname)
    setGen(gender as GenderOption)
    setBday(birthday)
    setAddr(address)
    const match = phone.match(/^\+\d{1,4}/)
    setPhoneCode(match ? match[0] : '+86')
    const numMatch = phone.match(/^\+\d{1,4}\s*/)
    setPhoneNum(numMatch ? phone.slice(numMatch[0].length) : phone)
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setMsg('')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('nickname', nick)
    fd.set('gender', gen)
    fd.set('birthday', bday)
    fd.set('address', addr)
    fd.set('phone', phoneNum.trim() ? `${phoneCode} ${phoneNum.trim()}` : '')
    if (file) fd.set('avatar', file)

    setBusy(true)
    setMsg('')
    const res = await updateProfile(fd)
    setBusy(false)
    if (res?.error) {
      setMsg('❌ ' + res.error)
    } else {
      setMsg('✅ ' + t('profileSaved'))
      router.refresh()
    }
  }

  return (
    <div>
      <h1>{t('myProfile')}</h1>
      <form className="form" onSubmit={onSubmit}>
        {/* 头像（在最上方，选择图片左侧预览） */}
        <div className="field">
          <label className="label">{t('avatar')}</label>
          <div className="avatar-upload">
            {preview ? (
              <img className="avatar-preview" src={preview} alt="" />
            ) : avatarUrl ? (
              <img className="avatar-preview" src={avatarUrl} alt="" />
            ) : (
              <div className="avatar-preview avatar-preview-empty">👤</div>
            )}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="file-input-hidden"
                onChange={(e) => onPickAvatar(e.target.files)}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fileRef.current?.click()}
              >
                {t('chooseImage')}
              </button>
              {file ? <p className="muted">{file.name}</p> : null}
            </div>
          </div>
        </div>

        <div className="field">
          <label className="label">{t('email')}</label>
          <input className="input" value={email} readOnly />
          <p className="muted">{t('emailReadOnly')}</p>
        </div>
        <div className="field">
          <label className="label">
            {t('nickname')} *
          </label>
          <input
            className="input"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="label">{t('gender')}</label>
          <select
            className="input"
            value={gen}
            onChange={(e) => setGen(e.target.value as GenderOption)}
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
            value={bday}
            onChange={(e) => setBday(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="label">{t('addressLabel')}</label>
          <textarea
            className="input"
            rows={3}
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            placeholder={t('addressPlaceholder')}
          />
        </div>
        <div className="field">
          <label className="label">{t('phoneNumber')}</label>
          <div className="phone-row">
            <select
              className="input phone-code"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
            >
              {PHONE_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} {c.label}
                </option>
              ))}
            </select>
            <input
              className="input"
              value={phoneNum}
              onChange={(e) => setPhoneNum(e.target.value)}
              placeholder="13800138000"
            />
          </div>
        </div>
        {msg ? <p className="muted">{msg}</p> : null}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy}
          >
            {busy ? '…' : t('save')}
          </button>
          <button
            className="btn btn-outline"
            type="button"
            onClick={onCancel}
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
