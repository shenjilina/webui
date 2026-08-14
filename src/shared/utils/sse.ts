import { storage } from '@/shared/utils/storage'
import { SSE_TIMEOUT, API_BASE_URL } from '@/shared/utils/constants'

/** SSE 事件类型 */
export interface SSEMessageEvent {
  type: 'message'
  data: { content: string }
}

export interface SSEReferencesEvent {
  type: 'references'
  data: {
    items: Array<{
      documentId: string
      title: string
      snippet: string
      score: number
    }>
  }
}

export interface SSEDoneEvent {
  type: 'done'
  data: { sessionId: string }
}

export interface SSEErrorEvent {
  type: 'error'
  data: { code: number; message: string }
}

export type SSEEvent = SSEMessageEvent | SSEReferencesEvent | SSEDoneEvent | SSEErrorEvent

export interface SSEStreamOptions {
  url: string
  body: Record<string, unknown>
  onMessage: (content: string) => void
  onReferences: (items: SSEReferencesEvent['data']['items']) => void
  onDone: (sessionId: string) => void
  onError: (message: string) => void
  signal?: AbortSignal
}

/**
 * 基于 fetch + ReadableStream 的 SSE 流式封装
 * 支持 POST 请求体、Authorization 请求头、AbortController 中止
 */
export async function startSSEStream(options: SSEStreamOptions): Promise<void> {
  const { url, body, onMessage, onReferences, onDone, onError, signal } = options
  const token = storage.getToken()

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), SSE_TIMEOUT)

  // 外部 signal 与内部 controller 联动
  if (signal) {
    signal.addEventListener('abort', () => controller.abort())
  }

  try {
    // 相对路径拼接 API 基础地址，绝对地址直接使用
    const fullUrl = /^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '未知错误')
      onError(`请求失败 (${response.status}): ${errText}`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onError('无法获取响应流')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 按双换行分割 SSE 事件
      const events = buffer.split('\n\n')
      // 最后一段可能不完整，保留到下次
      buffer = events.pop() || ''

      for (const eventText of events) {
        if (!eventText.trim()) continue

        let eventType = ''
        let eventData = ''

        for (const line of eventText.split('\n')) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            eventData = line.slice(5).trim()
          }
        }

        if (!eventData) continue

        try {
          const parsed = JSON.parse(eventData)

          switch (eventType || parsed.type) {
            case 'message':
              onMessage(parsed.content)
              break
            case 'references':
              onReferences(parsed.items)
              break
            case 'done':
              onDone(parsed.sessionId)
              return
            case 'error':
              onError(parsed.message || '问答异常')
              return
          }
        } catch {
          // 半截 JSON，忽略
        }
      }
    }

    // 流正常结束但未收到 done 事件
    onDone('')
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        // 用户主动中止，不报错
        return
      }
      onError(err.message || '网络请求失败')
    } else {
      onError('未知错误')
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
