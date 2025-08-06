#!/usr/bin/env tsx

/**
 * 演示数据设置脚本
 * 用于初始化数据库和生成演示数据
 */

import { DemoDataGenerator } from '../src/lib/demo-data';
import { db } from '../src/lib/db';

async function checkConnection() {
  console.log('🔍 检查数据库连接...');
  
  try {
    await db.machineCategory.count();
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('\n请确保:');
    console.log('1. 已运行 npm run db:push 初始化数据库');
    console.log('2. 已运行 npm run db:seed 生成基础数据');
    console.log('3. SQLite 数据库文件可访问');
    return false;
  }
}

async function checkTables() {
  console.log('🔍 检查数据库表结构...');
  
  try {
    await db.machineCategory.findFirst();
    console.log('✅ 表 machine_categories 存在');
    
    await db.machineModel.findFirst();
    console.log('✅ 表 machine_models 存在');
    
    await db.machineComponent.findFirst();
    console.log('✅ 表 machine_components 存在');
    
    await db.testSession.findFirst();
    console.log('✅ 表 test_sessions 存在');
    
    await db.simulationData.findFirst();
    console.log('✅ 表 simulation_data 存在');
    
    await db.testData.findFirst();
    console.log('✅ 表 test_data 存在');
    
    return true;
  } catch (error) {
    console.error('❌ 数据库表结构不完整:', error.message);
    return false;
  }
}

async function checkBasicData() {
  console.log('🔍 检查基础数据...');
  
  try {
    const categoriesCount = await db.machineCategory.count();
    const modelsCount = await db.machineModel.count();
    
    console.log(`✅ 找到 ${categoriesCount} 个机床类别`);
    console.log(`✅ 找到 ${modelsCount} 个机床型号`);
    
    if (categoriesCount === 0 || modelsCount === 0) {
      console.log('⚠️  基础数据不完整，请运行: npm run db:seed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 检查基础数据失败:', error.message);
    return false;
  }
}

async function generateDemoData() {
  console.log('🚀 开始生成演示数据...');
  
  try {
    // 清理现有演示数据
    console.log('🧹 清理现有演示数据...');
    await DemoDataGenerator.cleanupDemoData();
    
    // 生成新的演示会话
    console.log('📊 生成演示测试会话...');
    const sessions = await DemoDataGenerator.generateMultipleDemoSessions();
    
    console.log(`✅ 成功生成 ${sessions.length} 个演示会话`);
    
    // 列出生成的会话
    sessions.forEach((session, index) => {
      console.log(`  ${index + 1}. ${session.session_name} (ID: ${session.id})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ 生成演示数据失败:', error.message);
    return false;
  }
}

async function showUsageInstructions() {
  console.log('\n🎉 设置完成！');
  console.log('\n📝 使用说明:');
  console.log('1. 启动开发服务器: npm run dev');
  console.log('2. 访问 http://localhost:8080');
  console.log('3. 浏览各个页面查看演示数据');
  console.log('\n🔧 可用功能:');
  console.log('- 机床管理: /category/lathe, /category/mill');
  console.log('- 数据分析: 点击测试会话查看详细分析');
  console.log('- 数据上传: /data-upload');
  console.log('- 系统设置: /settings');
  console.log('\n💡 提示:');
  console.log('- 演示数据包含仿真数据、测试数据和分析结果');
  console.log('- 可以在代码中调用 DemoDataGenerator 生成更多数据');
  console.log('- 如需清理演示数据，运行: DemoDataGenerator.cleanupDemoData()');
}

async function main() {
  console.log('🚀 机床数据管理平台 - 演示环境设置');
  console.log('=====================================\n');
  
  // 检查连接
  if (!(await checkConnection())) {
    process.exit(1);
  }
  
  // 检查表结构
  if (!(await checkTables())) {
    console.log('\n❌ 数据库表结构不完整');
    console.log('请先运行数据库初始化:');
    console.log('  npm run db:push');
    process.exit(1);
  }
  
  // 检查基础数据
  if (!(await checkBasicData())) {
    console.log('\n❌ 基础数据不完整，无法生成演示数据');
    process.exit(1);
  }
  
  // 生成演示数据
  if (!(await generateDemoData())) {
    process.exit(1);
  }
  
  // 显示使用说明
  await showUsageInstructions();
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

// 运行主函数
main().catch((error) => {
  console.error('❌ 设置失败:', error.message);
  process.exit(1);
});