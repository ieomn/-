/**
 * 初始化用户数据脚本
 * 确保数据库中有必要的用户记录
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initUsers() {
  try {
    console.log('🚀 开始初始化用户数据...');
    
    // 检查是否已有用户
    const existingUsers = await prisma.userProfile.findMany();
    console.log(`📋 当前数据库中有 ${existingUsers.length} 个用户`);
    
    if (existingUsers.length > 0) {
      console.log('👥 现有用户列表:');
      existingUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.fullName}) - ${user.role} - ID: ${user.id}`);
      });
    }
    
    // 创建或更新管理员用户
    const adminUser = await prisma.userProfile.upsert({
      where: { email: 'admin@machine-nexus.com' },
      update: {
        fullName: '系统管理员',
        role: 'ADMIN',
        department: '通用技术集团机床工程研究院',
        updatedAt: new Date()
      },
      create: {
        email: 'admin@machine-nexus.com',
        fullName: '系统管理员',
        role: 'ADMIN',
        department: '通用技术集团机床工程研究院',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ 管理员用户已创建/更新:', adminUser.email, 'ID:', adminUser.id);
    
    // 创建演示工程师用户
    const engineerUser = await prisma.userProfile.upsert({
      where: { email: 'engineer@machine-nexus.com' },
      update: {
        fullName: '演示工程师',
        role: 'ENGINEER',
        department: '通用技术集团机床工程研究院',
        updatedAt: new Date()
      },
      create: {
        email: 'engineer@machine-nexus.com',
        fullName: '演示工程师',
        role: 'ENGINEER',
        department: '通用技术集团机床工程研究院',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ 工程师用户已创建/更新:', engineerUser.email, 'ID:', engineerUser.id);
    
    // 创建演示操作员用户
    const operatorUser = await prisma.userProfile.upsert({
      where: { email: 'operator@machine-nexus.com' },
      update: {
        fullName: '演示操作员',
        role: 'OPERATOR',
        department: '通用技术集团机床工程研究院',
        updatedAt: new Date()
      },
      create: {
        email: 'operator@machine-nexus.com',
        fullName: '演示操作员',
        role: 'OPERATOR',
        department: '通用技术集团机床工程研究院',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ 操作员用户已创建/更新:', operatorUser.email, 'ID:', operatorUser.id);
    
    // 显示最终用户列表
    const finalUsers = await prisma.userProfile.findMany({
      orderBy: { role: 'asc' }
    });
    
    console.log('\n🎉 用户初始化完成！');
    console.log('📋 最终用户列表:');
    finalUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.fullName}) - ${user.role} - ID: ${user.id}`);
    });
    
    console.log('\n💡 现在可以使用以下邮箱登录:');
    console.log('  - admin@machine-nexus.com (管理员)');
    console.log('  - engineer@machine-nexus.com (工程师)');
    console.log('  - operator@machine-nexus.com (操作员)');
    
  } catch (error) {
    console.error('❌ 用户初始化失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行初始化
initUsers().catch(console.error);
