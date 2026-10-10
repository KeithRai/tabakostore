'use client'

import { openChat } from './navbar'
import { useLang } from './lang-provider'

// 打开客服聊天的按钮（用于帮助页等服务端页面）
export default function ContactButton() {
  const { t } = useLang()
  return (
    <button className="btn btn-primary" onClick={openChat}>
      {t('openChat')}
    </button>
  )
}
