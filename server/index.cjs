/**
 * 简单的API服务器
 * 为前端提供数据库访问接口
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 创建上传目录
const uploadsDir = path.join(__dirname, 'uploads');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

// 确保上传目录存在
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);
fs.mkdir(thumbnailsDir, { recursive: true }).catch(console.error);

// 配置静态文件服务
app.use('/uploads', express.static(uploadsDir));

// 错误处理中间件
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==================== 用户相关API ====================

// 获取或创建演示用户
app.get('/api/users/demo', asyncHandler(async (req, res) => {
  let demoUser = await prisma.userProfile.findFirst({
    where: { email: 'admin@machine-nexus.com' }
  });

  if (!demoUser) {
    demoUser = await prisma.userProfile.create({
      data: {
        email: 'admin@machine-nexus.com',
        fullName: '演示管理员',
        role: 'ADMIN',
        department: '技术部'
      }
    });
  }

  res.json(demoUser);
}));

// 获取所有用户
app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await prisma.userProfile.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(users);
}));

// 更新用户资料
app.put('/api/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // 首先检查用户是否存在
  const existingUser = await prisma.userProfile.findUnique({
    where: { id }
  });
  
  if (!existingUser) {
    console.log(`❌ 用户不存在: ${id}`);
    console.log('🔍 尝试查找所有用户...');
    
    // 查找所有用户，帮助调试
    const allUsers = await prisma.userProfile.findMany({
      select: { id: true, email: true, fullName: true, role: true }
    });
    console.log('📋 数据库中的用户:', allUsers);
    
    return res.status(404).json({ 
      error: '用户不存在',
      message: `ID为 ${id} 的用户未找到`,
      availableUsers: allUsers
    });
  }
  
  console.log(`✅ 找到用户: ${existingUser.email} (${existingUser.fullName})`);
  console.log(`🔄 更新内容:`, updates);
  
  const user = await prisma.userProfile.update({
    where: { id },
    data: updates
  });
  
  console.log(`✅ 用户更新成功: ${user.email}`);
  res.json(user);
}));

// ==================== 仪表板统计API ====================

app.get('/api/dashboard/stats', asyncHandler(async (req, res) => {
  const [
    totalTestRecords,
    completedAnalyses,
    activeMachines,
    recentSessions
  ] = await Promise.all([
    prisma.testData.count(),
    prisma.analysisResult.count(),
    prisma.machineModel.count({ where: { status: 'ACTIVE' } }),
    prisma.testSession.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        model: true,
        operator: true
      }
    })
  ]);

  // 计算平均错误率（模拟）
  const averageErrorRate = Math.random() * 5; // 0-5%的随机错误率

  res.json({
    totalTestRecords,
    completedAnalyses,
    averageErrorRate: parseFloat(averageErrorRate.toFixed(2)),
    activeMachines,
    recentSessions
  });
}));

// ==================== 机床相关API ====================

// 获取机床类别
app.get('/api/machines/categories', asyncHandler(async (req, res) => {
  const categories = await prisma.machineCategory.findMany({
    include: { models: true },
    orderBy: { name: 'asc' }
  });
  res.json(categories);
}));

// 获取机床型号
app.get('/api/machines/models', asyncHandler(async (req, res) => {
  const models = await prisma.machineModel.findMany({
    include: {
      category: true,
      components: true
    },
    orderBy: { name: 'asc' }
  });
  res.json(models);
}));

// ==================== 测试相关API ====================

// 获取测试会话
app.get('/api/test/sessions', asyncHandler(async (req, res) => {
  const sessions = await prisma.testSession.findMany({
    include: {
      model: { include: { category: true } },
      operator: true
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(sessions);
}));

// 创建测试会话
app.post('/api/test/sessions', asyncHandler(async (req, res) => {
  const session = await prisma.testSession.create({
    data: req.body,
    include: {
      model: { include: { category: true } },
      operator: true
    }
  });
  res.json(session);
}));

// ==================== 分析相关API ====================

// 获取分析结果
app.get('/api/analysis/results', asyncHandler(async (req, res) => {
  const results = await prisma.analysisResult.findMany({
    include: { analyst: true },
    orderBy: { createdAt: 'desc' }
  });
  
  // 解析JSON字符串字段
  const parsedResults = results.map(result => ({
    ...result,
    results: result.results ? JSON.parse(result.results) : null
  }));
  
  res.json(parsedResults);
}));

// ==================== 文件相关API ====================

// 文件路由模块将在服务器启动时异步加载

// ==================== 系统统计API ====================

app.get('/api/system/statistics', asyncHandler(async (req, res) => {
  const stats = await prisma.systemStatistic.findMany({
    orderBy: { timestamp: 'desc' }
  });
  res.json(stats);
}));

// ==================== 健康检查API ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'API服务器运行正常'
  });
});

// ==================== 错误处理 ====================

app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// 启动服务器
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 异步加载文件路由模块
    try {
      const fileRoutes = await import('./routes/files.js');
      app.use('/api/files', fileRoutes.default);
      console.log('✅ 文件路由模块加载成功');
    } catch (error) {
      console.error('❌ 文件路由模块加载失败:', error);
      console.log('🔄 服务器将继续运行，但文件上传功能可能不可用');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 API服务器运行在 http://localhost:${PORT}`);
      console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`📈 仪表板数据: http://localhost:${PORT}/api/dashboard/stats`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer().catch(console.error);