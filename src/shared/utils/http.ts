import axios, { type AxiosError } from 'axios'
import { toast } from 'sonner'
import { API_BASE_URL, API_TIMEOUT } from './constants'
import { storage } from './storage'
import { getApiErrorMessage } from './apiError'
import { handleUnauthorized } from './authEvents'
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' }
})
http.interceptors.request.use((config) => {
  const token = storage.getToken()
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})
http.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse
    if (body.code !== 0) {
      const message = getApiErrorMessage(body)
      toast.error(message)
      return Promise.reject(new Error(message))
    }
    return response
  },
  (error: AxiosError) => {
    if (axios.isCancel(error)) return Promise.reject(error)
    const message = error.response
      ? getApiErrorMessage(error.response.data, '请求失败 (' + error.response.status + ')')
      : '网络请求失败，请检查后端是否运行'
    const isLoginRequest =
      error.config?.url === '/auth/login' || error.config?.url === '/auth/register'
    if (error.response?.status === 401 && !isLoginRequest) handleUnauthorized()
    toast.error(message)
    return Promise.reject(new Error(message))
  }
)
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  return (await http.get<ApiResponse<T>>(url, { params })).data.data
}
export async function post<T>(url: string, data?: unknown): Promise<T> {
  return (
    await http.post<ApiResponse<T>>(url, data, {
      headers: data instanceof FormData ? { 'Content-Type': undefined } : undefined
    })
  ).data.data
}
export async function put<T>(url: string, data?: unknown): Promise<T> {
  return (await http.put<ApiResponse<T>>(url, data)).data.data
}
export async function patch<T>(url: string, data?: unknown): Promise<T> {
  return (await http.patch<ApiResponse<T>>(url, data)).data.data
}
export async function del<T>(url: string, data?: unknown): Promise<T> {
  return (await http.delete<ApiResponse<T>>(url, { data })).data.data
}
export default http
