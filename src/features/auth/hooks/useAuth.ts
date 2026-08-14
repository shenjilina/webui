import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { login as loginApi, getUserInfo, changePassword } from '../api'
import { useUserStore } from '../store/userStore'
import type { LoginRequest, ChangePasswordRequest } from '../types'

export function useAuth() {
  const navigate = useNavigate()
  const { login: storeLogin, logout: storeLogout, isLogin, userInfo, token } = useUserStore()

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (res) => {
      storeLogin(res.token, res.userInfo)
      toast.success('登录成功')
      navigate('/')
    },
    onError: (err: Error) => {
      toast.error(err.message || '登录失败')
    },
  })

  const logout = () => {
    storeLogout()
    navigate('/login')
  }

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    onSuccess: () => {
      toast.success('密码修改成功，请重新登录')
      storeLogout()
      navigate('/login')
    },
  })

  const fetchUserInfo = async () => {
    try {
      const info = await getUserInfo()
      useUserStore.getState().updateUserInfo(info)
    } catch {
      // ignore
    }
  }

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
    fetchUserInfo,
    isLogin,
    userInfo,
    token,
  }
}
