function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}
export function getApiErrorMessage(value: unknown, fallback = '请求失败'): string {
  const body = object(value)
  const errors = object(body.data).errors ?? body.detail
  if (Array.isArray(errors)) {
    const messages = errors
      .map((item) => {
        const error = object(item)
        return error.message ?? error.msg
      })
      .filter((message): message is string => typeof message === 'string' && !!message.trim())
    if (messages.length) return messages.join('；')
  }
  for (const message of [body.detail, body.message]) {
    if (typeof message === 'string' && message.trim()) return message.trim()
  }
  return fallback
}
