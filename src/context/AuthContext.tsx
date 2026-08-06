import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  isGuest: boolean
  signInWithPhone: (phone: string) => Promise<{ error?: string }>
  verifyOTP: (phone: string, token: string) => Promise<{ error?: string }>
  signInWithWechat: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
  enterGuestMode: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    if (!supabase) {
      // 未配置 Supabase，自动进入游客模式
      setIsGuest(true)
      setLoading(false)
      return
    }

    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      // 注意：如果无 session，不设 isGuest=true！让 App.tsx 守卫自动显示登录页
      setLoading(false)
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setIsGuest(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithPhone = useCallback(async (phone: string) => {
    if (!supabase) return { error: '未配置云服务' }
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) return { error: error.message }
    return {}
  }, [])

  const verifyOTP = useCallback(async (phone: string, token: string) => {
    if (!supabase) return { error: '未配置云服务' }
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    if (error) return { error: error.message }
    return {}
  }, [])

  const signInWithWechat = useCallback(async () => {
    if (!supabase) return { error: '未配置云服务' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github', // 占位：实际部署时替换为微信 provider
      options: { redirectTo: window.location.origin }
    })
    if (error) return { error: error.message }
    return {}
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setIsGuest(false)
  }, [])

  const enterGuestMode = useCallback(() => {
    setIsGuest(true)
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading, isGuest,
      signInWithPhone, verifyOTP, signInWithWechat, signOut, enterGuestMode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
