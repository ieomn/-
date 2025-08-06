import { db } from '@/lib/db';
import type { UploadedFile } from '@prisma/client';

export interface FileUploadResult {
  file: UploadedFile;
  uploadUrl?: string;
}

export interface FileProcessingResult {
  success: boolean;
  data?: any[];
  error?: string;
  metadata?: {
    rowCount?: number;
    columnCount?: number;
    fileSize?: number;
    processingTime?: number;
  };
}

export class FileService {
  // 模拟文件上传（简化版本）
  static async uploadFile(
    file: File,
    sessionId: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    try {
      // 模拟上传进度
      if (onProgress) {
        const progressSteps = [0, 25, 50, 75, 100];
        for (const progress of progressSteps) {
          onProgress(progress);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // 计算文件哈希（简单版本）
      const fileHash = await this.calculateFileHash(file);

      // 获取当前用户
      const currentUser = await db.userProfile.findFirst({
        where: { role: 'ADMIN' }
      });

      // 记录文件信息到数据库
      const fileRecord = await db.uploadedFile.create({
        data: {
          sessionId,
          uploaderId: currentUser?.id,
          fileName: file.name,
          filePath: `uploads/${sessionId}/${file.name}`,
          fileSize: file.size,
          fileType: file.name.split('.').pop() || 'unknown',
          mimeType: file.type,
          fileHash,
          status: 'UPLOADED'
        }
      });

      return {
        file: fileRecord,
        uploadUrl: `mock://uploads/${sessionId}/${file.name}`
      };
    } catch (error) {
      throw error;
    }
  }

  // 处理上传的数据文件
  static async processDataFile(fileId: string): Promise<FileProcessingResult> {
    const startTime = Date.now();

    try {
      // 更新文件状态为处理中
      await db.uploadedFile.update({
        where: { id: fileId },
        data: { status: 'PROCESSING' }
      });

      // 获取文件信息
      const fileInfo = await db.uploadedFile.findUnique({
        where: { id: fileId }
      });

      if (!fileInfo) {
        throw new Error('File not found');
      }

      // 模拟文件处理（实际中需要实现真实的文件解析）
      const processingTime = Date.now() - startTime;
      const mockData = this.generateMockDataForFileType(fileInfo.fileType);

      const result: FileProcessingResult = {
        success: true,
        data: mockData,
        metadata: {
          rowCount: mockData.length,
          columnCount: mockData.length > 0 ? Object.keys(mockData[0]).length : 0,
          fileSize: fileInfo.fileSize,
          processingTime
        }
      };

      // 更新文件状态和处理结果
      await db.uploadedFile.update({
        where: { id: fileId },
        data: {
          status: 'PROCESSED',
          processingResults: result.metadata
        }
      });

      return result;

    } catch (error) {
      // 更新文件状态为错误
      await db.uploadedFile.update({
        where: { id: fileId },
        data: {
          status: 'ERROR',
          processingResults: { error: error.message }
        }
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // 生成模拟数据（基于文件类型）
  private static generateMockDataForFileType(fileType: string): any[] {
    const baseData = [
      { parameter: '转速', value: 3980, unit: 'rpm', timestamp: new Date().toISOString() },
      { parameter: '温度', value: 42.3, unit: '°C', timestamp: new Date().toISOString() },
      { parameter: '振动', value: 0.023, unit: 'mm', timestamp: new Date().toISOString() },
      { parameter: '压力', value: 15.6, unit: 'MPa', timestamp: new Date().toISOString() },
      { parameter: '扭矩', value: 485, unit: 'Nm', timestamp: new Date().toISOString() }
    ];

    return baseData;
  }

  // 解析CSV文件（模拟版本）
  private static async parseCSV(text: string): Promise<any[]> {
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          const value = values[index];
          const numValue = parseFloat(value);
          row[header] = isNaN(numValue) ? value : numValue;
        });
        data.push(row);
      }
    }

    return data;
  }

  // 解析JSON文件
  private static async parseJSON(text: string): Promise<any[]> {
    const jsonData = JSON.parse(text);
    return Array.isArray(jsonData) ? jsonData : [jsonData];
  }

  // 计算文件哈希
  private static async calculateFileHash(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      // 简化的哈希计算
      return `hash-${file.name}-${file.size}-${Date.now()}`;
    }
  }

  // 获取会话的所有文件
  static async getSessionFiles(sessionId: string): Promise<UploadedFile[]> {
    try {
      return await db.uploadedFile.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      throw error;
    }
  }

  // 删除文件
  static async deleteFile(fileId: string): Promise<void> {
    try {
      await db.uploadedFile.delete({
        where: { id: fileId }
      });
    } catch (error) {
      throw error;
    }
  }

  // 模拟下载文件
  static async downloadFile(fileId: string): Promise<{ data: Blob; fileName: string }> {
    try {
      const fileInfo = await db.uploadedFile.findUnique({
        where: { id: fileId }
      });

      if (!fileInfo) {
        throw new Error('File not found');
      }

      // 创建模拟的文件内容
      const mockContent = 'Mock file content for demonstration';
      const blob = new Blob([mockContent], { type: 'text/plain' });

      return {
        data: blob,
        fileName: fileInfo.fileName
      };
    } catch (error) {
      throw error;
    }
  }

  // 获取文件统计信息
  static async getFileStatistics() {
    try {
      const files = await db.uploadedFile.findMany({
        select: { fileSize: true, status: true, fileType: true }
      });

      const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
      const statusCounts = files.reduce((acc, file) => {
        acc[file.status] = (acc[file.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const typeCounts = files.reduce((acc, file) => {
        acc[file.fileType] = (acc[file.fileType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalFiles: files.length,
        totalSize,
        statusCounts,
        typeCounts
      };
    } catch (error) {
      throw error;
    }
  }
}