import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { API_BASE_URL, API_TIMEOUT } from '@/shared/utils/constants'
import { storage } from '@/shared/utils/storage'

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

interface ApiErrorDetail {
  field?: string
  message?: string
  type?: string
}

interface ApiErrorData {
  errors?: ApiErrorDetail[]
  request_id?: string
}

/** 优先显示字段级错误，无法提取时回退到顶层 message。 */
function getApiErrorMessage(response: Partial<ApiResponse> | null | undefined): string {
  const data = response?.data as ApiErrorData | null | undefined
  const details = Array.isArray(data?.errors)
    ? data.errors.map((item) => item.message?.trim()).filter(Boolean)
    : []

  return details.length > 0 ? details.join('；') : response?.message?.trim() || '请求失败'
}

let isHandling401 = false

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' }
})

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error: unknown) => Promise.reject(error)
)

http.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data as ApiResponse
    if (data.code !== 0) {
      const message = getApiErrorMessage(data)
      toast.error(message)
      return Promise.reject(new Error(message))
    }
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    if (!error.response) {
      toast.error('网络请求失败')
      return Promise.reject(error)
    }

    const { status, data } = error.response
    const message = getApiErrorMessage(data)
    if (message) {
      toast.error(message || '登录已过期，请重新登录')
      return Promise.reject(new Error(message))
    }
    debugger;
    if (status === 401) {
      if (!isHandling401) {
        isHandling401 = true
        storage.clear()
        window.dispatchEvent(new Event('auth:unauthorized'))
        toast.error('登录已过期，请重新登录')
        window.location.href = '/login'
        setTimeout(() => {
          isHandling401 = false
        }, 1000)
      }
      return Promise.reject(new Error(message))
    }

    toast.error(message || `请求失败 (${status})`)
    return Promise.reject(error)
  }
)

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await http.get<ApiResponse<T>>(url, { params })
  return res.data.data
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const res = await http.post<ApiResponse<T>>(url, data)
  return res.data.data
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  const res = await http.put<ApiResponse<T>>(url, data)
  return res.data.data
}

export async function del<T>(url: string): Promise<T> {
  const res = await http.delete<ApiResponse<T>>(url)
  return res.data.data
}

export default http
