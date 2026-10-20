import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './apiError'
describe('API error messages', () => {
  it('uses business validation details', () =>
    expect(
      getApiErrorMessage({ message: 'invalid', data: { errors: [{ message: '密码至少8位' }] } })
    ).toBe('密码至少8位'))
  it('uses FastAPI validation details', () =>
    expect(
      getApiErrorMessage({ detail: [{ loc: ['body', 'question'], msg: 'Field required' }] })
    ).toContain('Field required'))
  it('uses detail strings and fallback', () => {
    expect(getApiErrorMessage({ detail: '未授权' })).toBe('未授权')
    expect(getApiErrorMessage(null)).toBe('请求失败')
  })
})
