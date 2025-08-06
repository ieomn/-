import { db } from '@/lib/db';

export interface DashboardStats {
  overview: {
    totalTestRecords: number;
    completedAnalyses: number;
    averageErrorRate: number;
    activeMachines: number;
  };
  recentActivity: {
    recentSessions: Array<{
      id: string;
      name: string;
      model: string;
      status: string;
      created_at: string;
    }>;
    recentUploads: Array<{
      id: string;
      fileName: string;
      uploader: string;
      created_at: string;
    }>;
  };
  charts: {
    errorTrends: Array<{
      date: string;
      averageError: number;
      sessionCount: number;
    }>;
    machineUsage: Array<{
      machine: string;
      sessionCount: number;
      lastUsed: string;
    }>;
    analysisTypes: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
  };
}

export interface PerformanceMetrics {
  timeRange: string;
  metrics: {
    testAccuracy: number;
    processingSpeed: number;
    systemUptime: number;
    dataIntegrity: number;
  };
  trends: {
    accuracy: Array<{ date: string; value: number }>;
    speed: Array<{ date: string; value: number }>;
    uptime: Array<{ date: string; value: number }>;
  };
}

export class DashboardService {
  // 获取仪表板概览统计
  static async getDashboardStats(): Promise<DashboardStats> {
    // 并行获取所有必要的数据
    const [
      systemStats,
      recentSessions,
      recentUploads,
      errorTrends,
      machineUsage,
      analysisTypes
    ] = await Promise.all([
      this.getSystemStatistics(),
      this.getRecentSessions(),
      this.getRecentUploads(),
      this.getErrorTrends(),
      this.getMachineUsage(),
      this.getAnalysisTypes()
    ]);

    return {
      overview: systemStats,
      recentActivity: {
        recentSessions,
        recentUploads
      },
      charts: {
        errorTrends,
        machineUsage,
        analysisTypes
      }
    };
  }

  // 获取系统统计概览
  private static async getSystemStatistics(): Promise<DashboardStats['overview']> {
    const [
      testDataCount,
      analysisCount,
      comparisonsData,
      machineCount
    ] = await Promise.all([
      db.testData.count(),
      db.analysisResult.count(),
      db.dataComparison.findMany({
        select: { relativeErrorPercent: true }
      }),
      db.machineModel.count({
        where: { status: 'ACTIVE' }
      })
    ]);

    const errors = comparisonsData.map(d => d.relativeErrorPercent);
    const averageErrorRate = errors.length > 0 
      ? errors.reduce((sum, err) => sum + err, 0) / errors.length
      : 0;

    return {
      totalTestRecords: testDataCount,
      completedAnalyses: analysisCount,
      averageErrorRate: Number(averageErrorRate.toFixed(1)),
      activeMachines: machineCount
    };
  }

  // 获取最近的测试会话
  private static async getRecentSessions(): Promise<DashboardStats['recentActivity']['recentSessions']> {
    const sessions = await db.testSession.findMany({
      include: {
        model: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return sessions.map(session => ({
      id: session.id,
      name: session.sessionName,
      model: session.model.name,
      status: session.status,
      created_at: session.createdAt.toISOString()
    }));
  }

  // 获取最近的文件上传
  private static async getRecentUploads(): Promise<DashboardStats['recentActivity']['recentUploads']> {
    const files = await db.uploadedFile.findMany({
      include: {
        uploader: {
          select: { fullName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return files.map(file => ({
      id: file.id,
      fileName: file.fileName,
      uploader: file.uploader?.fullName || file.uploader?.email || 'Unknown',
      created_at: file.createdAt.toISOString()
    }));
  }

  // 获取误差趋势数据
  private static async getErrorTrends(): Promise<DashboardStats['charts']['errorTrends']> {
    // 获取最近30天的数据
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await db.dataComparison.findMany({
      select: {
        relativeErrorPercent: true,
        createdAt: true
      },
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // 按日期分组计算平均误差
    const groupedData = data.reduce((acc, item) => {
      const date = item.createdAt.toISOString().split('T')[0]; // 只取日期部分
      if (!acc[date]) {
        acc[date] = { errors: [], count: 0 };
      }
      acc[date].errors.push(item.relativeErrorPercent);
      acc[date].count++;
      return acc;
    }, {} as Record<string, { errors: number[]; count: number }>);

    return Object.entries(groupedData).map(([date, data]) => ({
      date,
      averageError: Number((data.errors.reduce((sum, err) => sum + err, 0) / data.errors.length).toFixed(2)),
      sessionCount: data.count
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  // 获取机床使用情况
  private static async getMachineUsage(): Promise<DashboardStats['charts']['machineUsage']> {
    const data = await db.testSession.findMany({
      include: {
        model: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 按机床型号分组统计
    const machineStats = data.reduce((acc, session) => {
      const machineName = session.model.name;
      if (!acc[machineName]) {
        acc[machineName] = {
          count: 0,
          lastUsed: session.createdAt.toISOString()
        };
      }
      acc[machineName].count++;
      if (session.createdAt > new Date(acc[machineName].lastUsed)) {
        acc[machineName].lastUsed = session.createdAt.toISOString();
      }
      return acc;
    }, {} as Record<string, { count: number; lastUsed: string }>);

    return Object.entries(machineStats).map(([machine, stats]) => ({
      machine,
      sessionCount: stats.count,
      lastUsed: stats.lastUsed
    })).sort((a, b) => b.sessionCount - a.sessionCount);
  }

  // 获取分析类型统计
  private static async getAnalysisTypes(): Promise<DashboardStats['charts']['analysisTypes']> {
    const data = await db.analysisResult.findMany({
      select: { analysisType: true }
    });

    const typeCounts = data.reduce((acc, analysis) => {
      acc[analysis.analysisType] = (acc[analysis.analysisType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(typeCounts).map(([type, count]) => ({
      type: this.translateAnalysisType(type),
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0
    }));
  }

  // 获取性能指标
  static async getPerformanceMetrics(timeRange: string = '30d'): Promise<PerformanceMetrics> {
    const days = this.parseTimeRange(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [accuracyData, speedData, uptimeData] = await Promise.all([
      this.getAccuracyTrend(startDate),
      this.getProcessingSpeedTrend(startDate),
      this.getUptimeTrend(startDate)
    ]);

    // 计算当前指标
    const currentAccuracy = accuracyData.length > 0 
      ? accuracyData[accuracyData.length - 1].value 
      : 0;
    
    const currentSpeed = speedData.length > 0
      ? speedData[speedData.length - 1].value
      : 0;

    const currentUptime = uptimeData.length > 0
      ? uptimeData[uptimeData.length - 1].value
      : 100;

    return {
      timeRange,
      metrics: {
        testAccuracy: currentAccuracy,
        processingSpeed: currentSpeed,
        systemUptime: currentUptime,
        dataIntegrity: 98.5 // 模拟值，实际应该从系统监控获取
      },
      trends: {
        accuracy: accuracyData,
        speed: speedData,
        uptime: uptimeData
      }
    };
  }

  // 获取精度趋势
  private static async getAccuracyTrend(startDate: Date): Promise<Array<{ date: string; value: number }>> {
    const data = await db.dataComparison.findMany({
      select: {
        relativeErrorPercent: true,
        createdAt: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // 按日期分组计算精度（100 - 平均误差率）
    const dailyData = this.groupByDate(data, 'createdAt', (items) => {
      const avgError = items.reduce((sum, item) => sum + item.relativeErrorPercent, 0) / items.length;
      return Math.max(0, 100 - avgError); // 精度 = 100% - 误差率
    });

    return dailyData;
  }

  // 获取处理速度趋势（模拟数据）
  private static async getProcessingSpeedTrend(startDate: Date): Promise<Array<{ date: string; value: number }>> {
    // 实际实现中应该从系统监控获取真实的处理速度数据
    const days = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const trend = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      trend.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(85 + Math.random() * 10) // 模拟85-95%的处理速度
      });
    }
    
    return trend;
  }

  // 获取系统可用性趋势（模拟数据）
  private static async getUptimeTrend(startDate: Date): Promise<Array<{ date: string; value: number }>> {
    // 实际实现中应该从系统监控获取真实的可用性数据
    const days = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const trend = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      trend.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(97 + Math.random() * 3) // 模拟97-100%的可用性
      });
    }
    
    return trend;
  }

  // 按日期分组数据
  private static groupByDate<T>(
    data: T[],
    dateField: keyof T,
    aggregateFn: (items: T[]) => number
  ): Array<{ date: string; value: number }> {
    const grouped = data.reduce((acc, item) => {
      const dateValue = item[dateField];
      const date = dateValue instanceof Date 
        ? dateValue.toISOString().split('T')[0]
        : String(dateValue).split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, T[]>);

    return Object.entries(grouped)
      .map(([date, items]) => ({
        date,
        value: Number(aggregateFn(items).toFixed(2))
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // 解析时间范围
  private static parseTimeRange(timeRange: string): number {
    const match = timeRange.match(/(\d+)([dMy])/);
    if (!match) return 30; // 默认30天

    const [, num, unit] = match;
    const value = parseInt(num, 10);

    switch (unit) {
      case 'd': return value;
      case 'M': return value * 30;
      case 'y': return value * 365;
      default: return 30;
    }
  }

  // 翻译分析类型
  private static translateAnalysisType(type: string): string {
    const translations: Record<string, string> = {
      'comparison': '对比分析',
      'trend': '趋势分析',
      'statistical': '统计分析'
    };
    return translations[type] || type;
  }

  // 更新系统统计信息
  static async updateSystemStatistics(): Promise<void> {
    const stats = await this.getSystemStatistics();
    
    const updates = [
      { metricName: 'total_test_records', metricValue: stats.totalTestRecords, metricType: 'COUNT' as const },
      { metricName: 'completed_analyses', metricValue: stats.completedAnalyses, metricType: 'COUNT' as const },
      { metricName: 'average_error_rate', metricValue: stats.averageErrorRate, metricType: 'PERCENTAGE' as const },
      { metricName: 'active_machines', metricValue: stats.activeMachines, metricType: 'COUNT' as const }
    ];

    for (const update of updates) {
      await db.systemStatistic.upsert({
        where: { metricName: update.metricName },
        update: {
          metricValue: update.metricValue,
          calculatedAt: new Date()
        },
        create: update
      });
    }
  }
}