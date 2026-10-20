import { expect, it, vi } from 'vitest'
import { fetchRegister, fetchLogin, fetchChangePassword, fetchUserInfo } from './index'
import { post, get } from '@/shared/utils/http'
vi.mock('@/shared/utils/http', () => ({ post: vi.fn(), get: vi.fn() }))
it('uses documented auth request bodies and profile endpoint', () => {
  const registration = { username: 'tester', email: 'test@example.com', password: '12345678' }
  fetchRegister(registration)
  expect(post).toHaveBeenCalledWith('/auth/register', registration)
  fetchLogin({ username: 'tester', password: 'x' })
  expect(post).toHaveBeenCalledWith('/auth/login', { username: 'tester', password: 'x' })
  fetchChangePassword({ oldPassword: 'x', newPassword: '12345678' })
  expect(post).toHaveBeenCalledWith('/auth/change-password', {
    oldPassword: 'x',
    newPassword: '12345678'
  })
  fetchUserInfo()
  expect(get).toHaveBeenCalledWith('/users/info')
})
