/**
 * API客户端 - 替换直接数据库访问
 */

const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API请求错误 [${endpoint}]:`, error);
      throw error;
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ==================== 仪表板API ====================
  
  async getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  // ==================== 用户API ====================
  
  async getDemoUser() {
    return this.get('/users/demo');
  }

  async getAllUsers() {
    return this.get('/users');
  }

  async updateUser(id: string, updates: any) {
    return this.put(`/users/${id}`, updates);
  }

  // ==================== 机床API ====================
  
  async getMachineCategories() {
    return this.get('/machines/categories');
  }

  async getMachineModels() {
    return this.get('/machines/models');
  }

  // ==================== 测试API ====================
  
  async getTestSessions() {
    return this.get('/test/sessions');
  }

  async createTestSession(data: any) {
    return this.post('/test/sessions', data);
  }

  // ==================== 分析API ====================
  
  async getAnalysisResults() {
    return this.get('/analysis/results');
  }

  // ==================== 文件API ====================
  
  async getUploadedFiles() {
    return this.get('/files');
  }

  // ==================== 系统统计API ====================
  
  async getSystemStatistics() {
    return this.get('/system/statistics');
  }
}

// 导出单例
export const apiClient = new ApiClient();
export default apiClient;