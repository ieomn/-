#!/usr/bin/env node

/**
 * 批量更新用户部门名称脚本
 * 将所有用户的部门设置为"通用技术集团机床工程研究院"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCompanyNames() {
  console.log('🏢 开始批量更新用户部门名称...');
  console.log('目标部门: 通用技术集团机床工程研究院');
  
  try {
    // 连接数据库
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 查看当前用户数量
    const userCount = await prisma.userProfile.count();
    console.log(`📊 当前用户总数: ${userCount}`);
    
    if (userCount === 0) {
      console.log('❌ 没有找到用户，无需更新');
      return;
    }
    
    // 显示更新前的用户信息
    console.log('\n📋 更新前的用户部门信息:');
    const usersBefore = await prisma.userProfile.findMany({
      select: { id: true, fullName: true, email: true, department: true }
    });
    
    usersBefore.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName || user.email} - 当前部门: ${user.department || '无'}`);
    });
    
    // 执行批量更新
    console.log('\n🔄 正在执行批量更新...');
    const updateResult = await prisma.userProfile.updateMany({
      data: {
        department: '通用技术集团机床工程研究院'
      }
    });
    
    console.log(`✅ 成功更新了 ${updateResult.count} 个用户的部门信息`);
    
    // 显示更新后的用户信息
    console.log('\n📋 更新后的用户部门信息:');
    const usersAfter = await prisma.userProfile.findMany({
      select: { id: true, fullName: true, email: true, department: true }
    });
    
    usersAfter.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName || user.email} - 新部门: ${user.department}`);
    });
    
    console.log('\n🎉 部门名称更新完成！');
    
  } catch (error) {
    console.error('❌ 更新过程中发生错误:', error);
  } finally {
    await prisma.$disconnect();
    console.log('📥 数据库连接已关闭');
  }
}

// 处理退出信号
process.on('SIGINT', async () => {
  console.log('\n正在关闭...');
  await prisma.$disconnect();
  process.exit(0);
});

// 执行更新
updateCompanyNames().catch(console.error);