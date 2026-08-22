import { get, post } from '@/shared/utils/http'
import type {
  LoginRequest,
  LoginResponse,
  UserInfo,
  ChangePasswordRequest,
} from '../types'

/** 登录 */
export function fetchLogin(data: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', data)
}

/** 退出登录 */
export function fetchLogout(): Promise<void> {
  return post<void>('/auth/logout')
}

/** 获取用户信息 */
export function fetchUserInfo(): Promise<UserInfo> {
  return get<UserInfo>('/users/info')
}

/** 修改密码 */
export function fetchChangePassword(data: ChangePasswordRequest): Promise<void> {
  return post<void>('/auth/change-password', data)
}
