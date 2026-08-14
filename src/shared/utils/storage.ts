const TOKEN_KEY = 'rag_token'
const USER_INFO_KEY = 'rag_user_info'
const THEME_KEY = 'rag_theme'

export const storage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },

  getUserInfo<T>(key: string = USER_INFO_KEY): T | null {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },

  setUserInfo<T>(info: T, key: string = USER_INFO_KEY): void {
    localStorage.setItem(key, JSON.stringify(info))
  },

  removeUserInfo(key: string = USER_INFO_KEY): void {
    localStorage.removeItem(key)
  },

  getTheme(): 'light' | 'dark' | null {
    return localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null
  },

  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(THEME_KEY, theme)
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
  },
}
