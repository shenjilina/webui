import { storage } from './storage'
import { SSE_TIMEOUT, API_BASE_URL } from './constants'
import { getApiErrorMessage } from './apiError'
import { handleUnauthorized } from './authEvents'

export interface StreamReference {
  documentId: string
  title: string
  snippet: string
  score: number | null
}
export interface StreamDone {
  conversationId: number | null
  answer: string
  success: boolean
  error?: string | null
}
export interface SSEStreamOptions {
  url: string
  body: object
  onMessage: (content: string) => void
  onReferences: (items: StreamReference[]) => void
  onDone: (result: StreamDone) => void
  onError: (message: string) => void
  signal?: AbortSignal
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('问答流返回了无效的数据')
  return value as Record<string, unknown>
}
function references(value: unknown): StreamReference[] {
  if (!Array.isArray(value)) throw new Error('引用来源格式无效')
  return value.map((item) => {
    const source = record(item)
    const meta = source.metadata ? record(source.metadata) : {}
    return {
      documentId: String(meta.document_id ?? meta.documentId ?? ''),
      title: String(meta.title ?? meta.filename ?? meta.source ?? '文档片段'),
      snippet: String(source.page_content ?? source.pageContent ?? ''),
      score: typeof source.score === 'number' ? source.score : null
    }
  })
}
/** POST SSE: data JSON uses event, snake_case source documents and conversation_id. */
export async function startSSEStream(options: SSEStreamOptions): Promise<void> {
  const { url, body, signal, onMessage, onReferences, onDone, onError } = options
  if (signal?.aborted) return
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, SSE_TIMEOUT)
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  let completed = false
  let reportedError = false
  const report = (message: string) => {
    if (!reportedError) {
      reportedError = true
      onError(message)
    }
  }
  const processFrame = (frame: string) => {
    const lines = frame.split(/\r?\n/)
    const data = lines
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n')
    if (!data) return
    const parsed = record(JSON.parse(data) as unknown)
    const kind =
      lines
        .find((line) => line.startsWith('event:'))
        ?.slice(6)
        .trim() || parsed.event
    switch (kind) {
      case 'sources':
        onReferences(references(parsed.source_documents))
        break
      case 'chunk':
        if (typeof parsed.content !== 'string') throw new Error('问答内容格式无效')
        onMessage(parsed.content)
        break
      case 'error':
        report(String(parsed.message || parsed.error || '问答服务异常'))
        break
      case 'done': {
        completed = true
        const result: StreamDone = {
          conversationId:
            typeof parsed.conversation_id === 'number' ? parsed.conversation_id : null,
          answer: typeof parsed.answer === 'string' ? parsed.answer : '',
          success: parsed.success === true,
          error: typeof parsed.error === 'string' ? parsed.error : null
        }
        if (!result.success) report(result.error || '问答未成功，请重试')
        onDone(result)
        break
      }
    }
  }
  try {
    const token = storage.getToken()
    const fullUrl = /^https?:\/\//.test(url) ? url : API_BASE_URL.replace(/\/$/, '') + url
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      },
      body: JSON.stringify(body),
      signal: controller.signal
    })
    if (!response.ok) {
      if (response.status === 401) handleUnauthorized()
      report(
        getApiErrorMessage(
          await response.json().catch(() => null),
          '请求失败 (' + response.status + ')'
        )
      )
      return
    }
    if (!response.headers.get('content-type')?.includes('text/event-stream')) {
      report(getApiErrorMessage(await response.json().catch(() => null), '服务未返回问答事件流'))
      return
    }
    reader = response.body?.getReader()
    if (!reader) throw new Error('无法获取响应流')
    const decoder = new TextDecoder()
    let buffer = ''
    while (!completed) {
      const { done, value } = await reader.read()
      if (signal?.aborted) return
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
      let separator: RegExpExecArray | null
      while ((separator = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, separator.index)
        buffer = buffer.slice(separator.index + separator[0].length)
        processFrame(frame)
        if (completed) break
      }
      if (done) {
        if (!completed && buffer.trim()) processFrame(buffer)
        if (!completed) report('连接中断，未收到问答完成事件，请检查历史记录后重试')
        break
      }
    }
  } catch (error: unknown) {
    if (timedOut) report('问答超时，请稍后重试')
    else if (!signal?.aborted) report(error instanceof Error ? error.message : '网络请求失败')
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
    if (reader) {
      await reader.cancel().catch(() => {})
      reader.releaseLock()
    }
  }
}
