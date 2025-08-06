#!/usr/bin/env node

/**
 * 数据库管理工具
 * 用于查看和管理本地SQLite数据库
 */

import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function showMenu() {
  console.log('\n==========================================');
  console.log('🗄️  机床数据管理平台 - 数据库管理工具');
  console.log('==========================================');
  console.log('1. 查看所有用户');
  console.log('2. 查看机床类别');
  console.log('3. 查看机床型号');
  console.log('4. 查看测试会话');
  console.log('5. 查看分析结果');
  console.log('6. 查看上传文件');
  console.log('7. 清除所有数据');
  console.log('8. 重新生成演示数据');
  console.log('9. 数据库统计信息');
  console.log('0. 退出');
  console.log('==========================================');
}

async function viewUsers() {
  console.log('\n📋 用户列表:');
  const users = await prisma.userProfile.findMany();
  
  if (users.length === 0) {
    console.log('❌ 没有找到用户数据');
    return;
  }

  users.forEach(user => {
    console.log(`- ID: ${user.id}`);
    console.log(`  邮箱: ${user.email}`);
    console.log(`  姓名: ${user.fullName}`);
    console.log(`  角色: ${user.role}`);
    console.log(`  部门: ${user.department || '无'}`);
    console.log(`  创建时间: ${user.createdAt.toLocaleString()}`);
    console.log('  ---');
  });
}

async function viewMachineCategories() {
  console.log('\n🏭 机床类别:');
  const categories = await prisma.machineCategory.findMany({
    include: { models: true }
  });
  
  if (categories.length === 0) {
    console.log('❌ 没有找到机床类别数据');
    return;
  }

  categories.forEach(category => {
    console.log(`- ${category.name} (${category.code})`);
    console.log(`  描述: ${category.description || '无'}`);
    console.log(`  型号数量: ${category.models.length}`);
    console.log('  ---');
  });
}

async function viewMachineModels() {
  console.log('\n🔧 机床型号:');
  const models = await prisma.machineModel.findMany({
    include: { category: true, components: true }
  });
  
  if (models.length === 0) {
    console.log('❌ 没有找到机床型号数据');
    return;
  }

  models.forEach(model => {
    console.log(`- ${model.name} (${model.code})`);
    console.log(`  类别: ${model.category.name}`);
    console.log(`  状态: ${model.status}`);
    console.log(`  组件数量: ${model.components.length}`);
    console.log('  ---');
  });
}

async function viewTestSessions() {
  console.log('\n🧪 测试会话:');
  const sessions = await prisma.testSession.findMany({
    include: { machineModel: true, operator: true }
  });
  
  if (sessions.length === 0) {
    console.log('❌ 没有找到测试会话数据');
    return;
  }

  sessions.forEach(session => {
    console.log(`- ${session.sessionName}`);
    console.log(`  机床: ${session.machineModel?.name || '未知'}`);
    console.log(`  操作员: ${session.operator?.fullName || '未知'}`);
    console.log(`  状态: ${session.status}`);
    console.log(`  类型: ${session.testType}`);
    console.log(`  创建时间: ${session.createdAt.toLocaleString()}`);
    console.log('  ---');
  });
}

async function viewAnalysisResults() {
  console.log('\n📊 分析结果:');
  const results = await prisma.analysisResult.findMany({
    include: { analyst: true }
  });
  
  if (results.length === 0) {
    console.log('❌ 没有找到分析结果数据');
    return;
  }

  results.forEach(result => {
    console.log(`- 分析类型: ${result.analysisType}`);
    console.log(`  分析师: ${result.analyst?.fullName || '未知'}`);
    console.log(`  摘要: ${result.summary || '无'}`);
    console.log(`  创建时间: ${result.createdAt.toLocaleString()}`);
    console.log('  ---');
  });
}

async function viewUploadedFiles() {
  console.log('\n📁 上传文件:');
  const files = await prisma.uploadedFile.findMany({
    include: { uploader: true }
  });
  
  if (files.length === 0) {
    console.log('❌ 没有找到上传文件数据');
    return;
  }

  files.forEach(file => {
    console.log(`- ${file.fileName}`);
    console.log(`  大小: ${file.fileSize} bytes`);
    console.log(`  类型: ${file.fileType}`);
    console.log(`  状态: ${file.status}`);
    console.log(`  上传者: ${file.uploader?.fullName || '未知'}`);
    console.log(`  上传时间: ${file.createdAt.toLocaleString()}`);
    console.log('  ---');
  });
}

async function clearAllData() {
  console.log('\n⚠️  警告：这将删除所有数据！');
  const confirm = await askQuestion('确定要继续吗？(yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes') {
    console.log('操作已取消');
    return;
  }

  console.log('正在清除数据...');
  
  // 按依赖关系顺序删除
  await prisma.analysisResult.deleteMany();
  await prisma.dataComparison.deleteMany();
  await prisma.uploadedFile.deleteMany();
  await prisma.testData.deleteMany();
  await prisma.simulationData.deleteMany();
  await prisma.testSession.deleteMany();
  await prisma.systemStatistic.deleteMany();
  await prisma.machineComponent.deleteMany();
  await prisma.machineModel.deleteMany();
  await prisma.machineCategory.deleteMany();
  await prisma.userProfile.deleteMany();
  
  console.log('✅ 所有数据已清除');
}

async function regenerateData() {
  console.log('\n🔄 重新生成演示数据...');
  
  try {
    // 首先清除现有数据
    await clearAllData();
    
    console.log('正在生成新的演示数据...');
    // 这里可以调用种子脚本
    const { spawn } = await import('child_process');
    
    const seedProcess = spawn('npm', ['run', 'db:seed'], {
      stdio: 'inherit',
      shell: true
    });
    
    seedProcess.on('close', async (code) => {
      if (code === 0) {
        console.log('✅ 基础数据生成完成');
        
        const demoProcess = spawn('npm', ['run', 'setup:demo'], {
          stdio: 'inherit',
          shell: true
        });
        
        demoProcess.on('close', (demoCode) => {
          if (demoCode === 0) {
            console.log('✅ 演示数据生成完成');
          } else {
            console.log('❌ 演示数据生成失败');
          }
        });
      } else {
        console.log('❌ 基础数据生成失败');
      }
    });
    
  } catch (error) {
    console.error('生成数据时出错:', error);
  }
}

async function showStatistics() {
  console.log('\n📈 数据库统计信息:');
  
  const [
    userCount,
    categoryCount,
    modelCount,
    sessionCount,
    fileCount,
    analysisCount
  ] = await Promise.all([
    prisma.userProfile.count(),
    prisma.machineCategory.count(),
    prisma.machineModel.count(),
    prisma.testSession.count(),
    prisma.uploadedFile.count(),
    prisma.analysisResult.count()
  ]);

  console.log(`👥 用户数量: ${userCount}`);
  console.log(`🏭 机床类别: ${categoryCount}`);
  console.log(`🔧 机床型号: ${modelCount}`);
  console.log(`🧪 测试会话: ${sessionCount}`);
  console.log(`📁 上传文件: ${fileCount}`);
  console.log(`📊 分析结果: ${analysisCount}`);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('连接到数据库...');
  
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    while (true) {
      await showMenu();
      const choice = await askQuestion('\n请选择操作 (0-9): ');
      
      switch (choice) {
        case '1':
          await viewUsers();
          break;
        case '2':
          await viewMachineCategories();
          break;
        case '3':
          await viewMachineModels();
          break;
        case '4':
          await viewTestSessions();
          break;
        case '5':
          await viewAnalysisResults();
          break;
        case '6':
          await viewUploadedFiles();
          break;
        case '7':
          await clearAllData();
          break;
        case '8':
          await regenerateData();
          break;
        case '9':
          await showStatistics();
          break;
        case '0':
          console.log('再见！');
          process.exit(0);
        default:
          console.log('无效选择，请重试');
      }
      
      await askQuestion('\n按 Enter 继续...');
    }
  } catch (error) {
    console.error('数据库连接失败:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// 处理退出信号
process.on('SIGINT', async () => {
  console.log('\n正在关闭...');
  await prisma.$disconnect();
  rl.close();
  process.exit(0);
});

main().catch(console.error);