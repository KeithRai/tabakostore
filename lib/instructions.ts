// 帮助信息解析（兼容旧版纯文本格式）
export function parseInstructions(
  raw: string | null | undefined
): { title: string; body: string } {
  if (!raw) return { title: '', body: '' }
  try {
    const parsed = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.body === 'string'
    ) {
      return {
        title:
          typeof parsed.title === 'string' ? parsed.title : '',
        body: parsed.body,
      }
    }
  } catch {
    // 旧版纯文本格式：整段作为正文
  }
  return { title: '', body: raw }
}
