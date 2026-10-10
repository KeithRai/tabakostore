'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/lang-provider'
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

  const [nick, setNick] = useState(nickname)
  const [gen, setGen] = useState<GenderOption>(gender as GenderOption)
  const [bday, setBday] = useState(birthday)
  const [addr, setAddr] = useState(address)
  const [phoneNum, setPhoneNum] = useState(phone)
  const [file, setFile] = useState<File | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('nickname', nick)
    fd.set('gender', gen)
    fd.set('birthday', bday)
    fd.set('address', addr)
    fd.set('phone', phoneNum)
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
          <label className="label">{t('avatar')}</label>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
                marginBottom: 8,
              }}
            />
          ) : null}
          <input
            className="file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? <p className="muted">已选择：{file.name}</p> : null}
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
          <input
            className="input"
            value={phoneNum}
            onChange={(e) => setPhoneNum(e.target.value)}
          />
        </div>
        {msg ? <p className="muted">{msg}</p> : null}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={busy}
          style={{ marginTop: 12 }}
        >
          {busy ? '…' : t('save')}
        </button>
      </form>
    </div>
  )
}
