import { storage } from './storage'
let handling = false
export function handleUnauthorized() {
  if (handling || typeof window === 'undefined') return
  handling = true
  storage.removeToken()
  window.dispatchEvent(new Event('auth:unauthorized'))
  window.setTimeout(() => {
    handling = false
  }, 1000)
}
