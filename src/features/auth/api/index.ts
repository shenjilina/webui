import { get, put, post } from '@/shared/utils/http'
import type {
  LoginRequest,
  LoginResponse,
  UserInfo,
  ChangePasswordRequest,
} from '../types'

/** 登录 */
export function login(data: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', data)
}

/** 获取用户信息 */
export function getUserInfo(): Promise<UserInfo> {
  return get<UserInfo>('/auth/me')
}

/** 修改密码 */
export function changePassword(data: ChangePasswordRequest): Promise<void> {
  return put<void>('/auth/password', data)
}
