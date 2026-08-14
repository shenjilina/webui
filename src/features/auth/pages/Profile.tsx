import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Key, LogOut, Calendar } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { useAuth } from '../hooks/useAuth'
import { formatDateTime } from '@/shared/utils/format'
import type { ChangePasswordRequest } from '../types'

interface PasswordForm extends ChangePasswordRequest {
  confirmPassword: string
}

export default function ProfilePage() {
  const { userInfo, changePassword, isChangingPassword, logout } = useAuth()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PasswordForm>()

  const onSubmit = (data: PasswordForm) => {
    changePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword })
    reset()
    setShowPasswordForm(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">个人中心</h1>

      {/* 用户信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {userInfo?.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{userInfo?.username || '-'}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                创建于 {userInfo?.createdAt ? formatDateTime(userInfo.createdAt) : '-'}
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>
              <Key className="h-4 w-4" />
              修改密码
            </Button>
            <Button variant="destructive" onClick={logout}>
              <LogOut className="h-4 w-4" />
              退出登录
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 修改密码表单 */}
      {showPasswordForm && (
        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>请输入旧密码和新密码</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>旧密码</Label>
                <Input type="password" {...register('oldPassword', { required: '请输入旧密码' })} />
                {errors.oldPassword && <p className="text-xs text-destructive">{errors.oldPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>新密码</Label>
                <Input
                  type="password"
                  {...register('newPassword', {
                    required: '请输入新密码',
                    minLength: { value: 6, message: '密码至少 6 位' },
                  })}
                />
                {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>确认新密码</Label>
                <Input
                  type="password"
                  {...register('confirmPassword', {
                    required: '请确认新密码',
                    validate: (val) => val === watch('newPassword') || '两次密码不一致',
                  })}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? '提交中...' : '确认修改'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowPasswordForm(false); reset() }}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
