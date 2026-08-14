import axios, { type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { storage } from '@/shared/utils/storage'
import { API_TIMEOUT, API_BASE_URL } from '@/shared/utils/constants'

/** 通用 API 返回结构 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页返回结构 */
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 401 去重标志 */
let isHandling401 = false

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

/** 请求拦截：注入 Authorization */
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) => Promise.reject(error),
)

/** 响应拦截：统一错误处理 */
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data as ApiResponse
    if (data.code !== 0) {
      toast.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const { status, data } = error.response

      if (status === 401) {
        if (!isHandling401) {
          isHandling401 = true
          storage.clear()
          // 通知全局登录态清空（userStore 监听），避免 shared 层反向依赖 features
          window.dispatchEvent(new Event('auth:unauthorized'))
          toast.error('登录已过期，请重新登录')
          window.location.href = '/login'
          setTimeout(() => {
            isHandling401 = false
          }, 1000)
        }
        return Promise.reject(new Error('未授权'))
      }

      if (status === 403) {
        toast.error('无权限访问')
        return Promise.reject(new Error('无权限'))
      }

      toast.error(data?.message || `请求失败 (${status})`)
    } else {
      toast.error('网络请求失败')
    }
    return Promise.reject(error)
  },
)

/** 封装 GET 请求，自动解包 data */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await http.get<ApiResponse<T>>(url, { params })
  return res.data.data
}

/** 封装 POST 请求 */
export async function post<T>(url: string, data?: unknown): Promise<T> {
  const res = await http.post<ApiResponse<T>>(url, data)
  return res.data.data
}

/** 封装 PUT 请求 */
export async function put<T>(url: string, data?: unknown): Promise<T> {
  const res = await http.put<ApiResponse<T>>(url, data)
  return res.data.data
}

/** 封装 DELETE 请求 */
export async function del<T>(url: string): Promise<T> {
  const res = await http.delete<ApiResponse<T>>(url)
  return res.data.data
}

export default http
