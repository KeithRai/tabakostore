// 发送订单确认邮件
// 使用 Resend 邮件服务（免费额度 3000 封/月）
// 需要在 Vercel 环境变量中配置 RESEND_API_KEY，未配置时自动跳过（不影响下单）

const RESEND_API = 'https://api.resend.com/emails'

export async function sendOrderConfirmationEmail(params: {
  to: string
  orderNo: string
  totalCny: string
  totalJpy: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  // 未配置 API Key：跳过发送
  if (!apiKey) return

  const from =
    process.env.RESEND_FROM ??
    'TabakoStore <onboarding@resend.dev>'
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  try {
    await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: `TabakoStore 订单确认 ${params.orderNo}`,
        text: [
          `您好，`,
          ``,
          `您的订单已成功创建。`,
          ``,
          `订单号：${params.orderNo}`,
          `订单金额：${params.totalCny} / ${params.totalJpy}`,
          ``,
          site ? `查看订单：${site}/orders` : `查看订单：登录后进入"我的订单"`,
          ``,
          `请通过客服聊天完成付款（微信支付 / 支付宝）。`,
          `付款后我们会尽快为您安排发货。`,
          ``,
          `感谢您的购买！`,
          `TabakoStore`,
        ].join('\n'),
      }),
    })
  } catch {
    // 邮件发送失败不影响下单流程
  }
}
