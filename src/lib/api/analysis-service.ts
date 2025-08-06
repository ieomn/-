import { db } from '@/lib/db';
import type { AnalysisResult, DataComparison } from '@prisma/client';

export interface AnalysisRequest {
  sessionId: string;
  analysisType: 'COMPARISON' | 'TREND' | 'STATISTICAL';
  parameters?: {
    confidenceLevel?: number;
    trendPeriod?: number;
    comparisonThreshold?: number;
  };
}

export interface ComparisonAnalysisResult {
  summary: {
    totalParameters: number;
    withinTolerance: number;
    averageError: number;
    maxError: number;
    minError: number;
  };
  details: DataComparison[];
  recommendations: string[];
}

export interface TrendAnalysisResult {
  trends: {
    parameter: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    slope: number;
    correlation: number;
  }[];
  forecast?: {
    parameter: string;
    predictedValues: { timestamp: string; value: number }[];
  }[];
}

export interface StatisticalAnalysisResult {
  statistics: {
    parameter: string;
    mean: number;
    median: number;
    stdDev: number;
    variance: number;
    min: number;
    max: number;
    count: number;
  }[];
  distribution: {
    parameter: string;
    histogram: { range: string; count: number }[];
  }[];
}

export class AnalysisService {
  // 执行对比分析
  static async performComparisonAnalysis(sessionId: string): Promise<ComparisonAnalysisResult> {
    try {
      // 获取对比数据
      const comparisons = await db.dataComparison.findMany({
        where: { sessionId }
      });

      const details = comparisons;
      const errors = details.map(d => d.relativeErrorPercent);
      
      const summary = {
        totalParameters: details.length,
        withinTolerance: details.filter(d => d.toleranceMet).length,
        averageError: errors.length > 0 ? errors.reduce((a, b) => a + b, 0) / errors.length : 0,
        maxError: errors.length > 0 ? Math.max(...errors) : 0,
        minError: errors.length > 0 ? Math.min(...errors) : 0
      };

      const recommendations = this.generateComparisonRecommendations(summary, details);

      const result: ComparisonAnalysisResult = {
        summary,
        details,
        recommendations
      };

      // 保存分析结果
      await this.saveAnalysisResult(sessionId, 'COMPARISON', result, summary.averageError / 100);

      return result;
    } catch (error) {
      throw error;
    }
  }

  // 执行趋势分析
  static async performTrendAnalysis(sessionId: string, period: number = 30): Promise<TrendAnalysisResult> {
    try {
      // 获取时间序列数据
      const [testData, simData] = await Promise.all([
        db.testData.findMany({
          where: { sessionId },
          orderBy: { measurementTimestamp: 'asc' }
        }),
        db.simulationData.findMany({
          where: { sessionId },
          orderBy: { timestamp: 'asc' }
        })
      ]);

      const allData = [
        ...testData.map(d => ({ ...d, timestamp: d.measurementTimestamp, source: 'test' })),
        ...simData.map(d => ({ ...d, source: 'simulation' }))
      ];

      // 按参数分组并计算趋势
      const parameterGroups = this.groupByParameter(allData);
      const trends = Object.entries(parameterGroups).map(([parameter, data]) => {
        const trend = this.calculateTrend(data);
        return {
          parameter,
          ...trend
        };
      });

      const result: TrendAnalysisResult = { trends };

      // 保存分析结果
      await this.saveAnalysisResult(sessionId, 'TREND', result, 0.8);

      return result;
    } catch (error) {
      throw error;
    }
  }

  // 执行统计分析
  static async performStatisticalAnalysis(sessionId: string): Promise<StatisticalAnalysisResult> {
    try {
      // 获取所有数据
      const [testData, simData] = await Promise.all([
        db.testData.findMany({ where: { sessionId } }),
        db.simulationData.findMany({ where: { sessionId } })
      ]);

      const allData = [...testData, ...simData];

      // 按参数分组并计算统计信息
      const parameterGroups = this.groupByParameter(allData);
      const statistics = Object.entries(parameterGroups).map(([parameter, data]) => {
        const values = data.map(d => d.parameterValue);
        return {
          parameter,
          ...this.calculateStatistics(values)
        };
      });

      // 计算分布
      const distribution = Object.entries(parameterGroups).map(([parameter, data]) => {
        const values = data.map(d => d.parameterValue);
        return {
          parameter,
          histogram: this.calculateHistogram(values)
        };
      });

      const result: StatisticalAnalysisResult = {
        statistics,
        distribution
      };

      // 保存分析结果
      await this.saveAnalysisResult(sessionId, 'STATISTICAL', result, 0.9);

      return result;
    } catch (error) {
      throw error;
    }
  }

  // 获取会话的分析结果
  static async getAnalysisResults(sessionId: string): Promise<AnalysisResult[]> {
    try {
      return await db.analysisResult.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      throw error;
    }
  }

  // 删除分析结果
  static async deleteAnalysisResult(resultId: string): Promise<void> {
    try {
      await db.analysisResult.delete({
        where: { id: resultId }
      });
    } catch (error) {
      throw error;
    }
  }

  // 保存分析结果
  private static async saveAnalysisResult(
    sessionId: string,
    analysisType: AnalysisResult['analysisType'],
    results: any,
    confidenceLevel: number
  ): Promise<AnalysisResult> {
    try {
      // 获取当前用户ID
      const currentUser = await db.userProfile.findFirst({
        where: { role: 'ADMIN' }
      });

      return await db.analysisResult.create({
        data: {
          sessionId,
          analystId: currentUser?.id,
          analysisType,
          results,
          confidenceLevel
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // 按参数分组数据
  private static groupByParameter(data: any[]): Record<string, any[]> {
    return data.reduce((groups, item) => {
      const param = item.parameterName;
      if (!groups[param]) {
        groups[param] = [];
      }
      groups[param].push(item);
      return groups;
    }, {});
  }

  // 计算趋势
  private static calculateTrend(data: any[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    slope: number;
    correlation: number;
  } {
    if (data.length < 2) {
      return { direction: 'stable', slope: 0, correlation: 0 };
    }

    // 将时间戳转换为数值
    const points = data.map((d, i) => ({
      x: i, // 简化为索引
      y: d.parameterValue
    }));

    // 线性回归计算斜率
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const correlation = this.calculateCorrelation(points);

    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < 0.01) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return { direction, slope, correlation };
  }

  // 计算相关系数
  private static calculateCorrelation(points: { x: number; y: number }[]): number {
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumYY = points.reduce((sum, p) => sum + p.y * p.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // 计算统计指标
  private static calculateStatistics(values: number[]): {
    mean: number;
    median: number;
    stdDev: number;
    variance: number;
    min: number;
    max: number;
    count: number;
  } {
    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / count;
    const median = count % 2 === 0 
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      median,
      stdDev,
      variance,
      min: Math.min(...values),
      max: Math.max(...values),
      count
    };
  }

  // 计算直方图
  private static calculateHistogram(values: number[], bins: number = 10): { range: string; count: number }[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;
    
    const histogram: { range: string; count: number }[] = [];
    
    for (let i = 0; i < bins; i++) {
      const rangeStart = min + i * binWidth;
      const rangeEnd = min + (i + 1) * binWidth;
      const count = values.filter(v => v >= rangeStart && (i === bins - 1 ? v <= rangeEnd : v < rangeEnd)).length;
      
      histogram.push({
        range: `${rangeStart.toFixed(2)}-${rangeEnd.toFixed(2)}`,
        count
      });
    }
    
    return histogram;
  }

  // 生成对比分析建议
  private static generateComparisonRecommendations(
    summary: ComparisonAnalysisResult['summary'],
    details: DataComparison[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (summary.averageError > 10) {
      recommendations.push('平均误差较大，建议检查仿真模型参数设置');
    }
    
    if (summary.withinTolerance / summary.totalParameters < 0.8) {
      recommendations.push('超出容差的参数较多，建议重新校准测试设备');
    }
    
    const highErrorParams = details.filter(d => d.relativeErrorPercent > 15);
    if (highErrorParams.length > 0) {
      recommendations.push(`以下参数误差较大，需要重点关注: ${highErrorParams.map(p => p.parameterName).join(', ')}`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('测试结果与仿真结果匹配良好，可以继续进行下一阶段测试');
    }
    
    return recommendations;
  }
}