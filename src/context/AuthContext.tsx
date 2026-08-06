import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  isGuest: boolean
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>
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

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: '未配置云端服务' }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    // 如果 Supabase 开启了邮箱确认，用户不会立即有 session
    if (data.user && !data.session) {
      return { error: '__email_confirm__' }
    }
    return {}
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: '未配置云端服务' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
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
      signUpWithEmail, signInWithEmail, signOut, enterGuestMode
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
