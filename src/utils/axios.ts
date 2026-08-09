import axios, { AxiosError } from 'axios'
import { backendBaseUrl } from '@/lib/constants'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/state'
import { navigationService } from '@/services/navigation'

// Axios 实例
const axiosInstance = axios.create({
  baseURL: backendBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ========== Token 管理 ==========
// 防止多个请求同时触发 token 刷新
let isRefreshingGuestToken = false;
let refreshTokenPromise: Promise<string> | null = null;

// 静默刷新 guest token（供流式请求等非 axios 场景复用）
export const silentRefreshGuestToken = async (): Promise<string> => {
  // 如果正在刷新，返回同一个 Promise
  if (isRefreshingGuestToken && refreshTokenPromise) {
    return refreshTokenPromise;
  }

  isRefreshingGuestToken = true;
  refreshTokenPromise = (async () => {
    try {
      // 调用 /auth-status 获取新的 guest token
      const response = await axios.get('/auth-status', {
        baseURL: backendBaseUrl,
        // 该请求必须跳过拦截器，避免携带已过期的 token
        headers: { 'X-Skip-Interceptor': 'true' }
      });

      if (response.data.access_token && !response.data.auth_configured) {
        const newToken = response.data.access_token;
        // 更新 localStorage
        localStorage.setItem('LIGHTRAG-API-TOKEN', newToken);
        // 更新认证状态
        useAuthStore.getState().login(
          newToken,
          true,
          response.data.core_version,
          response.data.api_version,
          response.data.webui_title || null,
          response.data.webui_description || null
        );
        return newToken;
      } else {
        throw new Error('Failed to get guest token');
      }
    } finally {
      isRefreshingGuestToken = false;
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

// 请求拦截器：注入 API Key 与认证 token
axiosInstance.interceptors.request.use((config) => {
  // token 刷新请求跳过拦截器
  if (config.headers['X-Skip-Interceptor']) {
    delete config.headers['X-Skip-Interceptor'];
    return config;
  }

  const apiKey = useSettingsStore.getState().apiKey
  const token = localStorage.getItem('LIGHTRAG-API-TOKEN');

  // 只要 token 存在就始终携带，与请求路径无关
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey
  }
  return config
})

// 响应拦截器：处理 token 续期与认证错误
axiosInstance.interceptors.response.use(
  (response) => {
    // ========== 检查后端返回的新 token ==========
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('LIGHTRAG-API-TOKEN', newToken);

      // 开发模式下可选的日志输出
      if (import.meta.env.DEV) {
        console.log('[Auth] Token auto-renewed by backend');
      }

      // 更新认证状态并记录续期信息
      try {
        const payload = JSON.parse(atob(newToken.split('.')[1]));
        const authStore = useAuthStore.getState();
        if (authStore.isAuthenticated) {
          // 记录 token 续期时间与过期时间
          const renewalTime = Date.now();
          const expiresAt = payload.exp ? payload.exp * 1000 : 0;
          authStore.setTokenRenewal(renewalTime, expiresAt);

          // 更新用户名（通常不会变化，仅作防御性处理）
          const newUsername = payload.sub;
          if (newUsername && newUsername !== authStore.username) {
            // 需要新增 setUsername 方法或通过 login 更新
            // 目前用户名变更极少，暂时跳过更新
          }
        }
      } catch (error) {
        console.warn('[Auth] Failed to parse renewed token:', error);
      }
    }
    // ========== token 续期检查结束 ==========

    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      if (error.response?.status === 401) {
        const originalRequest = error.config;

        // 1. 登录接口直接抛出错误
        if (originalRequest?.url?.includes('/login')) {
          throw error;
        }

        // 2. 防止无限重试
        if (originalRequest && (originalRequest as any)._retry) {
          navigationService.navigateToLogin();
          return Promise.reject(new Error('Authentication required'));
        }

        // 3. 检查是否处于 guest 模式
        const authStore = useAuthStore.getState();
        const currentToken = localStorage.getItem('LIGHTRAG-API-TOKEN');
        const isGuest = currentToken && authStore.isGuestMode;

        // 4. guest 模式：静默刷新 token 并重试
        if (isGuest && originalRequest) {
          try {
            const newToken = await silentRefreshGuestToken();

            // 标记已重试，防止无限循环
            (originalRequest as any)._retry = true;

            // 更新请求头中的 token
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

            // 重试原请求
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error('Failed to refresh guest token:', refreshError);
            // 刷新失败，跳转登录页
            navigationService.navigateToLogin();
            return Promise.reject(new Error('Failed to refresh authentication'));
          }
        }

        // 5. 非 guest 模式：跳转登录页
        navigationService.navigateToLogin();
        return Promise.reject(new Error('Authentication required'));
      }
      throw new Error(
        `${error.response.status} ${error.response.statusText}\n${JSON.stringify(
          error.response.data
        )}\n${error.config?.url}`
      )
    }
    throw error
  }
)

export default axiosInstance
