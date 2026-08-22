import type { UserInfo } from '@/features/auth/types'

/** mock 用户信息 */
export const mockUser: UserInfo = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  isActive: true,
  createdAt: '2025-01-15T09:30:00.000Z',
  updatedAt: '2025-01-15T09:30:00.000Z',
}

/** mock 登录凭证 */
export const MOCK_USERNAME = 'admin'
export const MOCK_PASSWORD = 'admin123'

/** mock token */
export const MOCK_TOKEN = 'mock-jwt-token-abc123'
