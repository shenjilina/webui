import { afterEach, describe, expect, it, vi } from 'vitest'
import { startSSEStream } from './sse'
import { SSE_TIMEOUT } from './constants'
import { handleUnauthorized } from './authEvents'
vi.mock('./authEvents', () => ({ handleUnauthorized: vi.fn() }))
vi.mock('./storage', () => ({ storage: { getToken: () => 'test-token' } }))
const callbacks = () => ({
  onMessage: vi.fn(),
  onReferences: vi.fn(),
  onDone: vi.fn(),
  onError: vi.fn()
})
function respond(text: string) {
  const bytes = new TextEncoder().encode(text)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(c) {
            for (let i = 0; i < bytes.length; i += 3) c.enqueue(bytes.slice(i, i + 3))
            c.close()
          }
        }),
        { headers: { 'Content-Type': 'text/event-stream' } }
      )
    )
  )
}
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
describe('backend SSE protocol', () => {
  it('handles data-only events, split UTF-8, CRLF and final frame without separator', async () => {
    const cb = callbacks()
    respond(
      'data: {"event":"sources","source_documents":[{"page_content":"原文","metadata":{"document_id":12,"title":"手册"},"score":0.2}]}\r\n\r\ndata: {"event":"chunk","content":"你好"}\r\n\r\ndata: {"event":"done","answer":"你好","success":true,"conversation_id":8}'
    )
    await startSSEStream({ url: '/conversations/ask/stream', body: {}, ...cb })
    expect(cb.onMessage).toHaveBeenCalledWith('你好')
    expect(cb.onReferences.mock.calls[0][0][0]).toMatchObject({
      documentId: '12',
      title: '手册',
      snippet: '原文',
      score: 0.2
    })
    expect(cb.onDone).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 8, answer: '你好', success: true })
    )
    expect(cb.onError).not.toHaveBeenCalled()
  })
  it('continues through error to consume the persisted done record', async () => {
    const cb = callbacks()
    respond(
      'data: {"event":"error","message":"模型不可用"}\n\ndata: {"event":"done","success":false,"answer":"","conversation_id":9}\n\n'
    )
    await startSSEStream({ url: '/x', body: {}, ...cb })
    expect(cb.onError).toHaveBeenCalledTimes(1)
    expect(cb.onDone).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 9, success: false })
    )
  })
  it('reports truncated streams instead of a fake successful completion', async () => {
    const cb = callbacks()
    respond('data: {"event":"chunk","content":"partial"}\n\n')
    await startSSEStream({ url: '/x', body: {}, ...cb })
    expect(cb.onDone).not.toHaveBeenCalled()
    expect(cb.onError).toHaveBeenCalled()
  })
  it('does not send a request when already cancelled', async () => {
    const cb = callbacks()
    respond('')
    const controller = new AbortController()
    controller.abort()
    await startSSEStream({ url: '/x', body: {}, signal: controller.signal, ...cb })
    expect(fetch).not.toHaveBeenCalled()
    expect(cb.onError).not.toHaveBeenCalled()
  })
  it('rejects malformed event JSON', async () => {
    const cb = callbacks()
    respond('data: {broken}\n\n')
    await startSSEStream({ url: '/x', body: {}, ...cb })
    expect(cb.onError).toHaveBeenCalled()
    expect(cb.onDone).not.toHaveBeenCalled()
  })
})

it('expires authentication on an SSE 401', async () => {
  vi.mocked(handleUnauthorized).mockClear()
  const cb = callbacks()
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ detail: '登录已过期' }), { status: 401 }))
  )
  await startSSEStream({ url: '/x', body: {}, ...cb })
  expect(handleUnauthorized).toHaveBeenCalledTimes(1)
  expect(cb.onError).toHaveBeenCalledWith('登录已过期')
})
function pendingStream() {
  const cancel = vi.fn().mockResolvedValue(undefined)
  const releaseLock = vi.fn()
  let started!: () => void
  const reading = new Promise<void>((resolve) => {
    started = resolve
  })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit) => ({
      ok: true,
      headers: new Headers({ 'Content-Type': 'text/event-stream' }),
      body: {
        getReader: () => ({
          cancel,
          releaseLock,
          read: () =>
            new Promise((_resolve, reject) => {
              started()
              init.signal?.addEventListener(
                'abort',
                () => reject(new DOMException('Aborted', 'AbortError')),
                { once: true }
              )
            })
        })
      }
    }))
  )
  return { cancel, releaseLock, reading }
}
it('silently cancels an in-progress read and releases its reader', async () => {
  const cb = callbacks(),
    controller = new AbortController(),
    stream = pendingStream()
  const task = startSSEStream({ url: '/x', body: {}, ...cb, signal: controller.signal })
  await stream.reading
  controller.abort()
  await task
  expect(cb.onError).not.toHaveBeenCalled()
  expect(cb.onDone).not.toHaveBeenCalled()
  expect(stream.cancel).toHaveBeenCalledTimes(1)
  expect(stream.releaseLock).toHaveBeenCalledTimes(1)
})
it('reports a timeout and releases its reader', async () => {
  vi.useFakeTimers()
  const cb = callbacks(),
    stream = pendingStream()
  const task = startSSEStream({ url: '/x', body: {}, ...cb })
  await stream.reading
  await vi.advanceTimersByTimeAsync(SSE_TIMEOUT)
  await task
  expect(cb.onError).toHaveBeenCalledWith('问答超时，请稍后重试')
  expect(stream.cancel).toHaveBeenCalledTimes(1)
  expect(stream.releaseLock).toHaveBeenCalledTimes(1)
})
