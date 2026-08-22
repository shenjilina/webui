/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** 登录请求 */
export interface LoginRequest {
  username: string
  password: string
}

/** 登录响应 */
export interface LoginResponse {
  userId: number
  username: string
  email: string
  accessToken: string
  tokenType?: string
  expiresIn: number
}

/** 修改密码请求 */
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}
