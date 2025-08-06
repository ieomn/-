import { db } from '@/lib/db';
import type { UserProfile } from '@prisma/client';

export interface UserStats {
  testSessionsCreated: number;
  filesUploaded: number;
  analysesPerformed: number;
  lastActivity: string | null;
}

export class UserService {
  // 获取或创建演示用户
  static async getOrCreateDemoUser(): Promise<UserProfile> {
    try {
      // 尝试获取演示用户
      let demoUser = await db.userProfile.findFirst({
        where: { email: 'admin@machine-nexus.com' }
      });

      // 如果没有演示用户，创建一个
      if (!demoUser) {
        demoUser = await db.userProfile.create({
          data: {
            email: 'admin@machine-nexus.com',
            fullName: '演示管理员',
            role: 'ADMIN',
            department: '技术部'
          }
        });
      }

      return demoUser;
    } catch (error) {
      console.error('Error getting or creating demo user:', error);
      throw error;
    }
  }

  // 获取当前用户档案 - 简化版本，返回第一个管理员用户
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      return await db.userProfile.findFirst({
        where: { role: 'ADMIN' }
      });
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // 更新用户档案
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentUser = await this.getCurrentUserProfile();
    if (!currentUser) throw new Error('User not authenticated');

    try {
      return await db.userProfile.update({
        where: { id: currentUser.id },
        data: updates
      });
    } catch (error) {
      throw error;
    }
  }

  // 获取所有用户（仅管理员可访问）
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      return await db.userProfile.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      throw error;
    }
  }

  // 创建用户档案
  static async createUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    try {
      return await db.userProfile.create({
        data: profile
      });
    } catch (error) {
      throw error;
    }
  }

  // 删除用户
  static async deleteUser(userId: string): Promise<void> {
    try {
      await db.userProfile.delete({
        where: { id: userId }
      });
    } catch (error) {
      throw error;
    }
  }

  // 获取用户统计信息
  static async getUserStats(userId?: string): Promise<UserStats> {
    const targetUser = userId ? 
      await db.userProfile.findUnique({ where: { id: userId } }) :
      await this.getCurrentUserProfile();
    
    if (!targetUser) throw new Error('User not found');

    const [sessionsCount, filesCount, analysesCount] = await Promise.all([
      db.testSession.count({ where: { operatorId: targetUser.id } }),
      db.uploadedFile.count({ where: { uploaderId: targetUser.id } }),
      db.analysisResult.count({ where: { analystId: targetUser.id } })
    ]);

    // 获取最后活动时间
    const [lastSession, lastFile, lastAnalysis] = await Promise.all([
      db.testSession.findFirst({
        where: { operatorId: targetUser.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),
      db.uploadedFile.findFirst({
        where: { uploaderId: targetUser.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),
      db.analysisResult.findFirst({
        where: { analystId: targetUser.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ]);

    const activities = [
      lastSession?.createdAt,
      lastFile?.createdAt,
      lastAnalysis?.createdAt
    ].filter(Boolean).sort((a, b) => b.getTime() - a.getTime());

    return {
      testSessionsCreated: sessionsCount,
      filesUploaded: filesCount,
      analysesPerformed: analysesCount,
      lastActivity: activities[0]?.toISOString() || null
    };
  }

  // 检查用户权限
  static async checkUserPermission(requiredRole: 'ADMIN' | 'ENGINEER' | 'OPERATOR'): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    if (!profile) return false;

    const roleHierarchy = { 'OPERATOR': 1, 'ENGINEER': 2, 'ADMIN': 3 };
    const userLevel = roleHierarchy[profile.role];
    const requiredLevel = roleHierarchy[requiredRole];

    return userLevel >= requiredLevel;
  }

  // 简化的认证方法 - 演示用途
  static async signIn(email: string, password: string): Promise<void> {
    // 演示版本：简单查找用户
    const user = await db.userProfile.findFirst({
      where: { email }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    // 在真实应用中这里会验证密码
  }

  static async signUp(email: string, password: string, userData?: {
    fullName?: string;
    role?: 'ADMIN' | 'ENGINEER' | 'OPERATOR';
    department?: string;
  }): Promise<void> {
    await db.userProfile.create({
      data: {
        email,
        fullName: userData?.fullName || '',
        role: userData?.role || 'OPERATOR',
        department: userData?.department
      }
    });
  }

  static async signOut(): Promise<void> {
    // 演示版本：无需实际登出逻辑
    return Promise.resolve();
  }

  static async resetPassword(email: string): Promise<void> {
    // 演示版本：模拟重置密码
    console.log(`Password reset requested for ${email}`);
  }

  static async updatePassword(newPassword: string): Promise<void> {
    // 演示版本：模拟密码更新
    console.log('Password updated');
  }

  // 获取用户活动日志
  static async getUserActivity(userId?: string, limit: number = 50): Promise<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    metadata?: any;
  }>> {
    const targetUser = userId ? 
      await db.userProfile.findUnique({ where: { id: userId } }) :
      await this.getCurrentUserProfile();
    
    if (!targetUser) return [];

    // 从多个表获取用户活动
    const [sessions, files, analyses] = await Promise.all([
      db.testSession.findMany({
        where: { operatorId: targetUser.id },
        orderBy: { createdAt: 'desc' },
        take: Math.floor(limit / 3),
        select: { id: true, sessionName: true, createdAt: true, status: true }
      }),
      db.uploadedFile.findMany({
        where: { uploaderId: targetUser.id },
        orderBy: { createdAt: 'desc' },
        take: Math.floor(limit / 3),
        select: { id: true, fileName: true, createdAt: true, status: true }
      }),
      db.analysisResult.findMany({
        where: { analystId: targetUser.id },
        orderBy: { createdAt: 'desc' },
        take: Math.floor(limit / 3),
        select: { id: true, analysisType: true, createdAt: true }
      })
    ]);

    const activities = [
      ...sessions.map(s => ({
        id: s.id,
        type: 'test_session',
        description: `创建测试会话: ${s.sessionName}`,
        timestamp: s.createdAt.toISOString(),
        metadata: { status: s.status }
      })),
      ...files.map(f => ({
        id: f.id,
        type: 'file_upload',
        description: `上传文件: ${f.fileName}`,
        timestamp: f.createdAt.toISOString(),
        metadata: { status: f.status }
      })),
      ...analyses.map(a => ({
        id: a.id,
        type: 'analysis',
        description: `执行${a.analysisType}分析`,
        timestamp: a.createdAt.toISOString(),
        metadata: { analysis_type: a.analysisType }
      }))
    ];

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // 获取团队统计
  static async getTeamStatistics(): Promise<{
    totalUsers: number;
    usersByRole: Record<string, number>;
    activeUsers: number;
    newUsersThisMonth: number;
  }> {
    const users = await db.userProfile.findMany({
      select: { role: true, createdAt: true }
    });

    const totalUsers = users.length;
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 计算活跃用户（最近30天有活动的用户）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentSessions, recentFiles, recentAnalyses] = await Promise.all([
      db.testSession.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { operatorId: true }
      }),
      db.uploadedFile.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { uploaderId: true }
      }),
      db.analysisResult.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { analystId: true }
      })
    ]);

    const activeUserIds = new Set([
      ...recentSessions.map(s => s.operatorId).filter(Boolean),
      ...recentFiles.map(f => f.uploaderId).filter(Boolean),
      ...recentAnalyses.map(a => a.analystId).filter(Boolean)
    ]);

    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = users.filter(
      user => user.createdAt >= firstDayOfMonth
    ).length;

    return {
      totalUsers,
      usersByRole,
      activeUsers: activeUserIds.size,
      newUsersThisMonth
    };
  }
}