import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, expect, it, vi } from 'vitest'
import http, { get, post, del } from './http'
import { handleUnauthorized } from './authEvents'
vi.mock('./authEvents', () => ({ handleUnauthorized: vi.fn() }))
vi.mock('./storage', () => ({ storage: { getToken: () => 'test-token' } }))
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))
beforeEach(() => vi.clearAllMocks())
it('rejects a business error instead of resolving its data', async () => {
  http.defaults.adapter = async (config) => ({
    data: { code: 7, message: '拒绝访问', data: null },
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config
  })
  await expect(get('/users/info')).rejects.toThrow('拒绝访问')
})
it('only expires authentication for protected 401 responses', async () => {
  http.defaults.adapter = async (config) => {
    throw new AxiosError('unauthorized', 'ERR_BAD_REQUEST', config, null, {
      data: { detail: '身份无效' },
      status: 401,
      statusText: 'Unauthorized',
      headers: new AxiosHeaders(),
      config
    })
  }
  await expect(post('/auth/login', {})).rejects.toThrow('身份无效')
  await expect(post('/auth/register', {})).rejects.toThrow('身份无效')
  expect(handleUnauthorized).not.toHaveBeenCalled()
  await expect(get('/users/info')).rejects.toThrow('身份无效')
  expect(handleUnauthorized).toHaveBeenCalledTimes(1)
})
it('sends delete confirmation in the JSON body with bearer authentication', async () => {
  const adapter = vi.fn(async (config) => ({
    data: { code: 0, message: 'success', data: null },
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config
  }))
  http.defaults.adapter = adapter
  await del('/knowledge-bases/delete', { knowledgeBaseId: 1, confirmationName: '知识库' })
  expect(adapter.mock.calls[0][0]).toMatchObject({
    method: 'delete',
    data: JSON.stringify({ knowledgeBaseId: 1, confirmationName: '知识库' })
  })
  expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer test-token')
})
