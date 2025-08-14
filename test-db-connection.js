/**
 * 测试数据库连接和用户数据
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 测试数据库连接...');
    
    // 测试连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 检查用户表
    const userCount = await prisma.userProfile.count();
    console.log(`📊 用户表记录数: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.userProfile.findMany({
        select: { id: true, email: true, fullName: true, role: true, department: true }
      });
      
      console.log('👥 现有用户:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}`);
        console.log(`    邮箱: ${user.email}`);
        console.log(`    姓名: ${user.fullName}`);
        console.log(`    角色: ${user.role}`);
        console.log(`    部门: ${user.department}`);
        console.log('');
      });
    } else {
      console.log('⚠️  没有找到用户记录');
      console.log('💡 建议运行: npm run db:init-users');
    }
    
    // 检查其他表
    const tables = ['machineCategory', 'machineModel', 'testSession', 'uploadedFile'];
    
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`📊 ${table} 表记录数: ${count}`);
      } catch (error) {
        console.log(`❌ ${table} 表不存在或无法访问`);
      }
    }
    
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行测试
testConnection();
