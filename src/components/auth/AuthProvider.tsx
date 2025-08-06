import React, { createContext, useContext, useEffect, useState } from 'react'
import type { UserProfile } from '@prisma/client'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: {
    fullName?: string;
    role?: 'ADMIN' | 'ENGINEER' | 'OPERATOR';
    department?: string;
  }) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  hasPermission: (requiredRole: 'ADMIN' | 'ENGINEER' | 'OPERATOR') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // 模拟的演示用户数据
  const demoUser: UserProfile = {
    id: 'demo-admin-001',
    email: 'admin@machine-nexus.com',
    fullName: '演示管理员',
    role: 'ADMIN',
    department: '技术部',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // 自动登录演示用户
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 检查本地存储的用户信息
        const savedUser = localStorage.getItem('demo_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser({ id: userData.id, email: userData.email })
          setProfile(userData)
        } else {
          // 从API获取或创建演示用户
          try {
            const { apiClient } = await import('@/lib/api-client')
            const demoUserFromAPI = await apiClient.getDemoUser()
            setUser({ id: demoUserFromAPI.id, email: demoUserFromAPI.email })
            setProfile(demoUserFromAPI)
            localStorage.setItem('demo_user', JSON.stringify(demoUserFromAPI))
          } catch (apiError) {
            // API不可用时使用本地演示用户
            console.warn('API not available, using local demo user:', apiError)
            setUser({ id: demoUser.id, email: demoUser.email })
            setProfile(demoUser)
            localStorage.setItem('demo_user', JSON.stringify(demoUser))
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // 如果出错，设置默认演示用户
        setUser({ id: demoUser.id, email: demoUser.email })
        setProfile(demoUser)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // 简化的登录逻辑 - 演示用途
      if (email === 'admin@machine-nexus.com') {
        setUser({ id: demoUser.id, email: demoUser.email })
        setProfile(demoUser)
        localStorage.setItem('demo_user', JSON.stringify(demoUser))
      } else {
        // 创建新用户档案（演示）
        const newUser = {
          ...demoUser,
          id: `user-${Date.now()}`,
          email,
          fullName: email.split('@')[0],
          role: 'OPERATOR' as const
        }
        setUser({ id: newUser.id, email: newUser.email })
        setProfile(newUser)
        localStorage.setItem('demo_user', JSON.stringify(newUser))
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw new Error('登录失败')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData?: {
    fullName?: string;
    role?: 'ADMIN' | 'ENGINEER' | 'OPERATOR';
    department?: string;
  }) => {
    try {
      setLoading(true)
      
      // 创建新用户档案
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        fullName: userData?.fullName || email.split('@')[0],
        role: userData?.role || 'OPERATOR',
        department: userData?.department || '技术部',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setUser({ id: newUser.id, email: newUser.email })
      setProfile(newUser)
      localStorage.setItem('demo_user', JSON.stringify(newUser))
    } catch (error) {
      console.error('Sign up error:', error)
      throw new Error('注册失败')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      setProfile(null)
      localStorage.removeItem('demo_user')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!profile) throw new Error('No user profile available')
      
      const updatedProfile = { ...profile, ...updates, updatedAt: new Date() }
      setProfile(updatedProfile)
      localStorage.setItem('demo_user', JSON.stringify(updatedProfile))
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const hasPermission = (requiredRole: 'ADMIN' | 'ENGINEER' | 'OPERATOR') => {
    if (!profile) return false
    
    const roleHierarchy = { 'OPERATOR': 1, 'ENGINEER': 2, 'ADMIN': 3 }
    const userLevel = roleHierarchy[profile.role as keyof typeof roleHierarchy]
    const requiredLevel = roleHierarchy[requiredRole]
    
    return userLevel >= requiredLevel
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}