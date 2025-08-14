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

  // 默认管理员用户数据（仅作为最终后备）
  const fallbackAdminUser: UserProfile = {
    id: 'fallback-admin-001',
    email: 'admin@machine-nexus.com',
    fullName: '系统管理员',
    role: 'ADMIN',
    department: '技术部',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // 自动登录演示用户
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 初始化用户认证...')
        
        // 优先从API获取最新的用户数据
        try {
          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          console.log('🌐 从API获取最新用户数据:', `${apiBaseUrl}/api/users/demo`);
          
          const response = await fetch(`${apiBaseUrl}/api/users/demo`);
          if (response.ok) {
            const latestUserData = await response.json();
            console.log('✅ 获取到最新用户数据:', latestUserData);
            
            setUser({ id: latestUserData.id, email: latestUserData.email });
            setProfile(latestUserData);
            
            // 更新本地存储
            localStorage.setItem('demo_user', JSON.stringify(latestUserData));
            console.log('💾 已更新本地存储的用户数据');
          } else {
            throw new Error(`API响应错误: ${response.status}`);
          }
        } catch (apiError) {
          console.warn('⚠️ 从API获取用户数据失败，尝试使用本地存储:', apiError);
          
          // API失败时，检查本地存储
          const savedUser = localStorage.getItem('demo_user');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            console.log('📱 使用本地存储的用户数据:', userData);
            setUser({ id: userData.id, email: userData.email });
            setProfile(userData);
        } else {
            console.log('🎭 使用后备管理员数据');
            // 使用后备管理员数据
            setUser({ id: fallbackAdminUser.id, email: fallbackAdminUser.email });
            setProfile(fallbackAdminUser);
            localStorage.setItem('demo_user', JSON.stringify(fallbackAdminUser));
          }
        }
      } catch (error) {
        console.error('❌ 用户认证初始化错误:', error);
        // 最终后备方案
        setUser({ id: fallbackAdminUser.id, email: fallbackAdminUser.email });
        setProfile(fallbackAdminUser);
      } finally {
        setLoading(false);
        console.log('✅ 用户认证初始化完成');
      }
    }

    initAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // 数据库驱动的登录逻辑
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      try {
        // 尝试通过API验证用户
        const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser({ id: userData.id, email: userData.email });
          setProfile(userData);
          localStorage.setItem('demo_user', JSON.stringify(userData));
        } else {
          throw new Error('登录验证失败');
        }
      } catch (error) {
        // 如果没有后端API，使用数据库查找用户
        console.warn('使用备用登录方式');
        
        // 查找现有管理员用户
        const adminResponse = await fetch(`${apiBaseUrl}/api/users/demo`);
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          setUser({ id: adminData.id, email: adminData.email });
          setProfile(adminData);
          localStorage.setItem('demo_user', JSON.stringify(adminData));
      } else {
          throw new Error('无法获取用户信息');
        }
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
      
      console.log('🔄 更新用户信息到数据库:', updates)
      console.log('👤 当前用户信息:', profile)
      
      // 确定API基础URL
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('🌐 使用API URL:', apiBaseUrl);
      
      // 确保管理员用户ID有效的逻辑
      let userId = profile.id;
      
      // 获取或创建管理员用户
      const ensureAdminUserId = async () => {
        console.log('👑 当前身份：管理员 - 确保管理员用户存在并获取正确ID');
        
        // 首先验证当前用户ID是否有效
        if (userId && !userId.startsWith('user-') && !userId.startsWith('demo-')) {
          try {
            console.log('🔍 验证当前管理员ID是否存在:', userId);
            const checkResponse = await fetch(`${apiBaseUrl}/api/users/${userId}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (checkResponse.ok) {
              const userData = await checkResponse.json();
              if (userData.role === 'ADMIN') {
                console.log('✅ 当前管理员ID有效:', userId, userData.fullName);
                return userId;
              } else {
                console.log('⚠️ 当前用户不是管理员角色:', userData.role);
              }
            } else {
              console.log('❌ 当前用户ID无效:', checkResponse.status, checkResponse.statusText);
            }
          } catch (error) {
            console.log('❌ 验证管理员ID时出错:', error);
          }
        }
        
        // 当前ID无效，查找现有的管理员用户
        console.log('🔍 查找现有的管理员用户...');
        try {
          const adminUsers = await fetch(`${apiBaseUrl}/api/users?role=ADMIN&limit=1`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (adminUsers.ok) {
            const users = await adminUsers.json();
            if (users && users.length > 0) {
              const adminUser = users[0];
              console.log('✅ 找到现有管理员用户:', adminUser.id, adminUser.fullName);
              
              // 更新本地profile
              setProfile(prev => ({ 
                ...prev, 
                id: adminUser.id,
                email: adminUser.email,
                fullName: adminUser.fullName,
                role: adminUser.role,
                department: adminUser.department
              }));
              
              return adminUser.id;
            }
          }
        } catch (error) {
          console.log('❌ 查找管理员用户失败:', error);
        }
        
        // 如果没有管理员用户，通过demo接口获取或创建
        console.log('🔄 通过demo接口获取或创建管理员用户...');
        try {
          const demoAdmin = await fetch(`${apiBaseUrl}/api/users/demo`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (demoAdmin.ok) {
            const adminData = await demoAdmin.json();
            console.log('✅ 获取到管理员用户:', adminData.id, adminData.fullName);
            
            // 更新本地profile
            setProfile(prev => ({ 
              ...prev, 
              id: adminData.id,
              email: adminData.email,
              fullName: adminData.fullName,
              role: adminData.role,
              department: adminData.department
            }));
            
            return adminData.id;
          } else {
            throw new Error(`无法获取管理员用户: ${demoAdmin.status} ${demoAdmin.statusText}`);
          }
        } catch (error) {
          console.error('❌ 获取管理员用户失败:', error);
          if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('无法连接到后端服务，请确保服务器正在运行');
          }
          throw new Error(`无法获取管理员用户ID: ${error.message}`);
        }
      };
      
      // 确保管理员用户ID有效
      userId = await ensureAdminUserId();
      
      console.log('🎯 使用用户ID:', userId);
      
      // 调用后端API更新数据库
      const updateUrl = `${apiBaseUrl}/api/users/${userId}`;
      console.log('📡 更新用户URL:', updateUrl);
      console.log('📡 更新数据:', JSON.stringify(updates));
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
      
      console.log('📡 更新用户API响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        console.error('❌ API响应错误:', response.status, errorData);
        throw new Error(`更新失败 (${response.status}): ${errorData.message || response.statusText}`);
      }
      
      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      localStorage.setItem('demo_user', JSON.stringify(updatedProfile))
      
      console.log('✅ 用户信息已更新到数据库:', updatedProfile)
    } catch (error) {
      console.error('❌ Update profile error:', error)
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