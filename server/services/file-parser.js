/**
 * 文件解析服务
 * 专门处理各种文件格式的解析
 */

import XLSX from 'xlsx';
import sharp from 'sharp';
import path from 'path';

class FileParser {
  /**
   * 解析Excel文件
   * @param {Buffer} buffer - 文件缓冲区
   * @param {string} fileName - 文件名
   * @returns {Object} 解析结果
   */
  static parseExcel(buffer, fileName) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      
      if (!sheetName) {
        throw new Error('Excel文件没有工作表');
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // 过滤空行
      const validData = jsonData.filter(row => row && row.some(cell => cell !== null && cell !== undefined && cell !== ''));
      
      const parsedData = {
        sheetNames: workbook.SheetNames,
        firstSheetData: validData.slice(0, 10), // 前10行数据
        totalRows: validData.length,
        totalColumns: validData[0]?.length || 0,
        headers: validData[0] || []
      };
      
      const processingResults = {
        type: 'excel',
        sheets: workbook.SheetNames.length,
        totalRows: validData.length,
        totalColumns: validData[0]?.length || 0,
        hasHeaders: validData.length > 0,
        dataTypes: this.analyzeDataTypes(validData)
      };

      return { parsedData, processingResults };
    } catch (error) {
      console.error('Excel解析失败:', error);
      return {
        parsedData: null,
        processingResults: { type: 'excel', error: error.message }
      };
    }
  }

  /**
   * 解析CSV文件
   * @param {Buffer} buffer - 文件缓冲区
   * @param {string} fileName - 文件名
   * @returns {Object} 解析结果
   */
  static parseCSV(buffer, fileName) {
    try {
      const csvContent = buffer.toString('utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      // 尝试检测分隔符
      const delimiter = this.detectDelimiter(lines[0] || '');
      const rows = lines.map(line => this.parseCSVLine(line, delimiter));
      
      // 过滤空行
      const validRows = rows.filter(row => row && row.some(cell => cell.trim() !== ''));
      
      const parsedData = {
        headers: validRows[0] || [],
        data: validRows.slice(1, 11), // 前10行数据
        totalRows: validRows.length,
        totalColumns: validRows[0]?.length || 0,
        delimiter
      };
      
      const processingResults = {
        type: 'csv',
        totalRows: validRows.length,
        totalColumns: validRows[0]?.length || 0,
        encoding: 'utf-8',
        delimiter,
        dataTypes: this.analyzeDataTypes(validRows)
      };

      return { parsedData, processingResults };
    } catch (error) {
      console.error('CSV解析失败:', error);
      return {
        parsedData: null,
        processingResults: { type: 'csv', error: error.message }
      };
    }
  }

  /**
   * 处理图片文件
   * @param {Buffer} buffer - 文件缓冲区
   * @param {string} fileName - 文件名
   * @param {string} outputDir - 输出目录
   * @returns {Object} 处理结果
   */
  static async processImage(buffer, fileName, outputDir) {
    try {
      const metadata = await sharp(buffer).metadata();
      
      // 生成缩略图
      const timestamp = Date.now();
      const ext = path.extname(fileName);
      const baseName = path.basename(fileName, ext);
      const thumbnailName = `thumb_${baseName}_${timestamp}.jpg`;
      const thumbnailPath = path.join(outputDir, 'thumbnails', thumbnailName);
      
      await sharp(buffer)
        .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      const processingResults = {
        type: 'image',
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha,
        thumbnailGenerated: true
      };

      return {
        thumbnailUrl: `/uploads/thumbnails/${thumbnailName}`,
        processingResults
      };
    } catch (error) {
      console.error('图片处理失败:', error);
      return {
        thumbnailUrl: null,
        processingResults: { type: 'image', error: error.message }
      };
    }
  }

  /**
   * 处理视频文件
   * @param {Buffer} buffer - 文件缓冲区
   * @param {string} fileName - 文件名
   * @param {string} mimeType - MIME类型
   * @returns {Object} 处理结果
   */
  static processVideo(buffer, fileName, mimeType) {
    const processingResults = {
      type: 'video',
      mimeType,
      size: buffer.length,
      canPreview: ['video/mp4', 'video/webm', 'video/ogg'].includes(mimeType),
      duration: null // 需要ffprobe来获取实际时长
    };

    return { processingResults };
  }

  /**
   * 解析JSON文件
   * @param {Buffer} buffer - 文件缓冲区
   * @param {string} fileName - 文件名
   * @returns {Object} 解析结果
   */
  static parseJSON(buffer, fileName) {
    try {
      const jsonContent = buffer.toString('utf-8');
      const data = JSON.parse(jsonContent);
      
      const parsedData = {
        preview: JSON.stringify(data, null, 2).slice(0, 1000), // 前1000字符
        structure: this.analyzeJSONStructure(data),
        size: jsonContent.length
      };
      
      const processingResults = {
        type: 'json',
        isArray: Array.isArray(data),
        itemCount: Array.isArray(data) ? data.length : Object.keys(data).length,
        structure: parsedData.structure
      };

      return { parsedData, processingResults };
    } catch (error) {
      console.error('JSON解析失败:', error);
      return {
        parsedData: null,
        processingResults: { type: 'json', error: error.message }
      };
    }
  }

  /**
   * 检测CSV分隔符
   * @param {string} line - 第一行内容
   * @returns {string} 分隔符
   */
  static detectDelimiter(line) {
    const delimiters = [',', ';', '\t', '|'];
    let maxCount = 0;
    let bestDelimiter = ',';
    
    for (const delimiter of delimiters) {
      const count = (line.match(new RegExp(delimiter, 'g')) || []).length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    }
    
    return bestDelimiter;
  }

  /**
   * 解析CSV行
   * @param {string} line - CSV行
   * @param {string} delimiter - 分隔符
   * @returns {Array} 解析后的字段数组
   */
  static parseCSVLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * 分析数据类型
   * @param {Array} rows - 数据行数组
   * @returns {Object} 类型分析结果
   */
  static analyzeDataTypes(rows) {
    if (!rows || rows.length < 2) return {};
    
    const headers = rows[0] || [];
    const dataRows = rows.slice(1);
    const types = {};
    
    headers.forEach((header, index) => {
      const values = dataRows.map(row => row[index]).filter(val => val != null && val !== '');
      
      if (values.length === 0) {
        types[header] = 'empty';
        return;
      }
      
      const numericCount = values.filter(val => !isNaN(Number(val))).length;
      const dateCount = values.filter(val => !isNaN(Date.parse(val))).length;
      
      if (numericCount / values.length > 0.8) {
        types[header] = 'numeric';
      } else if (dateCount / values.length > 0.8) {
        types[header] = 'date';
      } else {
        types[header] = 'text';
      }
    });
    
    return types;
  }

  /**
   * 分析JSON结构
   * @param {any} data - JSON数据
   * @returns {Object} 结构分析结果
   */
  static analyzeJSONStructure(data, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return 'too_deep';
    
    if (Array.isArray(data)) {
      return {
        type: 'array',
        length: data.length,
        itemTypes: data.length > 0 ? this.analyzeJSONStructure(data[0], depth + 1, maxDepth) : 'empty'
      };
    } else if (typeof data === 'object' && data !== null) {
      const structure = {};
      Object.keys(data).slice(0, 10).forEach(key => { // 只分析前10个键
        structure[key] = this.analyzeJSONStructure(data[key], depth + 1, maxDepth);
      });
      return { type: 'object', keys: Object.keys(data).length, structure };
    } else {
      return typeof data;
    }
  }
}

export default FileParser;
