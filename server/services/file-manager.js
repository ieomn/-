/**
 * 文件管理服务
 * 处理文件存储、路径管理等
 */

import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import FileParser from './file-parser.js';

const prisma = new PrismaClient();

class FileManager {
  constructor(uploadsDir) {
    this.uploadsDir = uploadsDir;
    this.thumbnailsDir = path.join(uploadsDir, 'thumbnails');
    this.ensureDirectories();
  }

  /**
   * 确保目录存在
   */
  async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(this.thumbnailsDir, { recursive: true });
    } catch (error) {
      console.error('创建目录失败:', error);
    }
  }

  /**
   * 生成安全的文件名
   * @param {string} originalName - 原始文件名
   * @returns {string} 安全的文件名
   */
  generateSafeFileName(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext)
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') // 替换特殊字符
      .substr(0, 50); // 限制长度
    
    return `${baseName}_${timestamp}_${random}${ext}`;
  }

  /**
   * 保存文件到磁盘
   * @param {Buffer} buffer - 文件缓冲区
   * @param {string} fileName - 文件名
   * @returns {string} 文件路径
   */
  async saveFile(buffer, fileName) {
    const safeFileName = this.generateSafeFileName(fileName);
    const filePath = path.join(this.uploadsDir, safeFileName);
    
    await fs.writeFile(filePath, buffer);
    return safeFileName;
  }

  /**
   * 处理文件上传和解析
   * @param {Object} options - 上传选项
   * @returns {Object} 处理结果
   */
  async processUpload({
    fileName,
    mimeType,
    dataBase64,
    fileSize,
    sessionId,
    description,
    uploaderId
  }) {
    try {
      console.log(`📤 开始处理文件: ${fileName} (${mimeType})`);
      
      // 解码Base64
      const buffer = Buffer.from(dataBase64, 'base64');
      const actualSize = buffer.length;
      
      // 保存文件
      const safeFileName = await this.saveFile(buffer, fileName);
      
      let thumbnailUrl = null;
      let parsedData = null;
      let processingResults = null;

      // 根据文件类型进行处理
      if (mimeType.startsWith('image/')) {
        const imageResult = await FileParser.processImage(buffer, fileName, this.uploadsDir);
        thumbnailUrl = imageResult.thumbnailUrl;
        processingResults = imageResult.processingResults;
        
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const excelResult = FileParser.parseExcel(buffer, fileName);
        parsedData = excelResult.parsedData;
        processingResults = excelResult.processingResults;
        
      } else if (fileName.endsWith('.csv')) {
        const csvResult = FileParser.parseCSV(buffer, fileName);
        parsedData = csvResult.parsedData;
        processingResults = csvResult.processingResults;
        
      } else if (fileName.endsWith('.json')) {
        const jsonResult = FileParser.parseJSON(buffer, fileName);
        parsedData = jsonResult.parsedData;
        processingResults = jsonResult.processingResults;
        
      } else if (mimeType.startsWith('video/')) {
        const videoResult = FileParser.processVideo(buffer, fileName, mimeType);
        processingResults = videoResult.processingResults;
        
      } else {
        // 其他文件类型
        processingResults = {
          type: 'document',
          mimeType,
          size: actualSize,
          canPreview: false
        };
      }

      // 保存到数据库
      const uploadedFile = await prisma.uploadedFile.create({
        data: {
          sessionId: sessionId || `upload-${Date.now()}`,
          uploaderId: uploaderId || null,
          fileName,
          filePath: safeFileName,
          fileSize: fileSize || actualSize,
          fileType: path.extname(fileName).replace('.', ''),
          mimeType: mimeType || 'application/octet-stream',
          fileHash: `enhanced-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          status: 'PROCESSED',
          processingResults: processingResults ? JSON.stringify(processingResults) : null,
        },
      });

      const result = {
        ...uploadedFile,
        url: `/uploads/${safeFileName}`,
        thumbnailUrl,
        parsedData,
        processingResults
      };

      console.log(`✅ 文件处理完成: ${fileName}`);
      return result;

    } catch (error) {
      console.error('文件处理失败:', error);
      throw new Error(`文件处理失败: ${error.message}`);
    }
  }

  /**
   * 获取文件详情
   * @param {string} fileId - 文件ID
   * @returns {Object} 文件详情
   */
  async getFileDetails(fileId) {
    const file = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
      include: { uploader: true }
    });

    if (!file) {
      throw new Error('文件未找到');
    }

    return {
      ...file,
      url: `/uploads/${file.filePath}`,
      processingResults: file.processingResults ? JSON.parse(file.processingResults) : null
    };
  }

  /**
   * 删除文件
   * @param {string} fileId - 文件ID
   */
  async deleteFile(fileId) {
    const file = await prisma.uploadedFile.findUnique({ where: { id: fileId } });
    
    if (!file) {
      throw new Error('文件未找到');
    }

    // 删除物理文件
    const filePath = path.join(this.uploadsDir, file.filePath);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('删除物理文件失败:', error.message);
    }

    // 删除数据库记录
    await prisma.uploadedFile.delete({ where: { id: fileId } });
  }

  /**
   * 获取文件列表
   * @param {Object} options - 查询选项
   * @returns {Array} 文件列表
   */
  async getFiles({ sessionId, uploaderId, limit = 50, offset = 0 } = {}) {
    const where = {};
    if (sessionId) where.sessionId = sessionId;
    if (uploaderId) where.uploaderId = uploaderId;

    const files = await prisma.uploadedFile.findMany({
      where,
      include: { uploader: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return files.map(file => ({
      ...file,
      url: `/uploads/${file.filePath}`,
      processingResults: file.processingResults ? JSON.parse(file.processingResults) : null
    }));
  }

  /**
   * 获取文件详细信息
   * @param {string} fileId - 文件ID
   * @returns {Object} 文件详细信息
   */
  async getFileDetails(fileId) {
    const file = await prisma.uploadedFile.findUnique({ 
      where: { id: fileId },
      include: { uploader: true }
    });
    
    if (!file) {
      throw new Error('文件未找到');
    }

    return {
      ...file,
      url: `/uploads/${file.filePath}`,
      processingResults: file.processingResults ? JSON.parse(file.processingResults) : null
    };
  }

  /**
   * 下载文件
   * @param {string} fileId - 文件ID
   * @returns {Object} 文件数据
   */
  async downloadFile(fileId) {
    const file = await this.getFileDetails(fileId);
    const filePath = path.join(this.uploadsDir, file.filePath);
    
    try {
      const data = await fs.readFile(filePath);
      return {
        fileName: file.fileName,
        mimeType: file.mimeType,
        data
      };
    } catch (error) {
      throw new Error('文件读取失败');
    }
  }

  /**
   * 获取统计信息 (重命名方法以保持一致性)
   * @returns {Object} 统计信息
   */
  async getStats() {
    return this.getFileStats();
  }

  /**
   * 获取文件统计信息
   * @returns {Object} 统计信息
   */
  async getFileStats() {
    const [
      totalFiles,
      totalSize,
      filesByType,
      recentFiles
    ] = await Promise.all([
      prisma.uploadedFile.count(),
      prisma.uploadedFile.aggregate({ _sum: { fileSize: true } }),
      prisma.uploadedFile.groupBy({
        by: ['fileType'],
        _count: { fileType: true },
        orderBy: { _count: { fileType: 'desc' } }
      }),
      prisma.uploadedFile.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { uploader: true }
      })
    ]);

    return {
      totalFiles,
      totalSize: totalSize._sum.fileSize || 0,
      filesByType: filesByType.map(item => ({
        type: item.fileType,
        count: item._count.fileType
      })),
      recentFiles: recentFiles.map(file => ({
        ...file,
        url: `/uploads/${file.filePath}`,
        processingResults: file.processingResults ? JSON.parse(file.processingResults) : null
      }))
    };
  }
}

export default FileManager;
