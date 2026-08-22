import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  fetchLogin,
  fetchLogout,
  fetchUserInfo as fetchUserInfoApi,
  fetchChangePassword,
} from '../api'
import { useUserStore } from '../store/userStore'
import type { LoginRequest, ChangePasswordRequest } from '../types'

export function useAuth() {
  const navigate = useNavigate()
  const { login: storeLogin, logout: storeLogout, isLogin, userInfo, token } = useUserStore()

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => fetchLogin(data),
    onSuccess: async (res) => {
      storeLogin(res.accessToken, {
        id: res.userId,
        username: res.username,
        email: res.email,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      })

      try {
        const userInfo = await fetchUserInfoApi()
        useUserStore.getState().updateUserInfo(userInfo)
      } catch {
        // 登录已成功；个人资料拉取失败时保留登录响应中的基础信息。
        if (!useUserStore.getState().isLogin) return
      }

      toast.success('登录成功')
      navigate('/')
    },
    // onError: (err: Error) => {
    //   toast.error(err || '登录失败')
    // },
  })

  const logoutMutation = useMutation({
    mutationFn: fetchLogout,
    onSettled: () => {
      storeLogout()
      navigate('/login')
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => fetchChangePassword(data),
    onSuccess: () => {
      toast.success('密码修改成功，请重新登录')
      storeLogout()
      navigate('/login')
    },
  })

  const fetchUserInfo = async () => {
    try {
      const info = await fetchUserInfoApi()
      useUserStore.getState().updateUserInfo(info)
    } catch {
      // ignore
    }
  }

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
    fetchUserInfo,
    isLogin,
    userInfo,
    token,
  }
}
