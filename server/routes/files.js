/**
 * 文件相关路由
 * 处理文件上传、下载、管理等API
 */

import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import FileManager from '../services/file-manager.js';

const router = express.Router();

// 错误处理中间件
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 初始化文件管理器
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
const fileManager = new FileManager(uploadsDir);

// 获取或创建管理员用户（用于文件上传）
async function getAdminUser() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  let adminUser = await prisma.userProfile.findFirst({ where: { role: 'ADMIN' } });
  
  if (!adminUser) {
    adminUser = await prisma.userProfile.create({
      data: {
        email: 'admin@machine-nexus.com',
        fullName: '系统管理员',
        role: 'ADMIN',
        department: '技术部'
      }
    });
  }
  
  return adminUser;
}

// 增强文件上传API - 主要上传接口
router.post('/upload-enhanced', asyncHandler(async (req, res) => {
  const { fileName, mimeType, dataBase64, fileSize, sessionId, description } = req.body;

  if (!fileName || !dataBase64) {
    return res.status(400).json({ error: 'fileName 和 dataBase64 为必填项' });
  }

  try {
    const adminUser = await getAdminUser();
    
    const result = await fileManager.processUpload({
      fileName,
      mimeType,
      dataBase64,
      fileSize,
      sessionId,
      description,
      uploaderId: adminUser.id
    });

    res.json(result);
  } catch (error) {
    console.error('文件上传处理错误:', error);
    res.status(500).json({ 
      error: '文件处理失败', 
      message: error.message 
    });
  }
}));

// 获取文件列表
router.get('/', asyncHandler(async (req, res) => {
  const { sessionId, uploaderId, limit, offset } = req.query;
  
  const files = await fileManager.getFiles({
    sessionId,
    uploaderId,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined
  });
  
  res.json(files);
}));

// 获取文件详细信息
router.get('/:id/details', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const fileDetails = await fileManager.getFileDetails(id);
    res.json(fileDetails);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}));

// 文件下载
router.get('/:id/download', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const fileData = await fileManager.downloadFile(id);
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.fileName}"`);
    res.send(fileData.data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}));

// 删除文件
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    await fileManager.deleteFile(id);
    res.json({ message: '文件删除成功' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}));

// 批量上传
router.post('/batch-upload', asyncHandler(async (req, res) => {
  const { files } = req.body;
  
  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'files 必须是非空数组' });
  }

  try {
    const adminUser = await getAdminUser();
    const results = [];
    
    for (const fileData of files) {
      try {
        const result = await fileManager.processUpload({
          ...fileData,
          uploaderId: adminUser.id
        });
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({ 
          success: false, 
          fileName: fileData.fileName, 
          error: error.message 
        });
      }
    }
    
    res.json({ results });
  } catch (error) {
    console.error('批量上传处理错误:', error);
    res.status(500).json({ 
      error: '批量上传处理失败', 
      message: error.message 
    });
  }
}));

// 文件统计信息
router.get('/stats/overview', asyncHandler(async (req, res) => {
  try {
    const stats = await fileManager.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

export default router;
