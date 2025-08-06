import { db } from '@/lib/db';
import type { TestSession, SimulationData, TestData, DataComparison, MachineModel, MachineComponent, UserProfile } from '@prisma/client';

export interface TestSessionWithDetails extends TestSession {
  model: MachineModel;
  component: MachineComponent;
  operator?: UserProfile;
}

export interface TestDataPoint {
  parameter_name: string;
  simulation_value?: number;
  test_value?: number;
  unit: string;
  timestamp: string;
}

export class TestService {
  // 创建测试会话
  static async createSession(session: Omit<TestSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestSession> {
    try {
      return await db.testSession.create({
        data: {
          ...session,
          operatorId: session.operatorId || (await this.getCurrentUserId())
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // 获取当前用户ID（简化版本）
  private static async getCurrentUserId(): Promise<string | null> {
    const user = await db.userProfile.findFirst({
      where: { role: 'ADMIN' }
    });
    return user?.id || null;
  }

  // 获取测试会话列表
  static async getSessions(filters?: {
    model_id?: string;
    component_id?: string;
    status?: string;
    limit?: number;
  }): Promise<TestSessionWithDetails[]> {
    try {
      const where: any = {};
      if (filters?.model_id) where.modelId = filters.model_id;
      if (filters?.component_id) where.componentId = filters.component_id;
      if (filters?.status) where.status = filters.status;

      return await db.testSession.findMany({
        where,
        include: {
          model: true,
          component: true,
          operator: true
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit
      });
    } catch (error) {
      throw error;
    }
  }

  // 获取测试会话详情
  static async getSessionDetails(sessionId: string): Promise<TestSessionWithDetails | null> {
    try {
      return await db.testSession.findUnique({
        where: { id: sessionId },
        include: {
          model: true,
          component: true,
          operator: true
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // 更新测试会话状态
  static async updateSessionStatus(sessionId: string, status: TestSession['status'], timestamps?: {
    started_at?: string;
    completed_at?: string;
  }): Promise<TestSession> {
    try {
      const updates: any = { status };
      if (timestamps?.started_at) updates.startedAt = new Date(timestamps.started_at);
      if (timestamps?.completed_at) updates.completedAt = new Date(timestamps.completed_at);

      return await db.testSession.update({
        where: { id: sessionId },
        data: updates
      });
    } catch (error) {
      throw error;
    }
  }

  // 添加仿真数据
  static async addSimulationData(sessionId: string, dataPoints: Omit<SimulationData, 'id' | 'sessionId' | 'createdAt'>[]): Promise<SimulationData[]> {
    try {
      const data = dataPoints.map(point => ({
        ...point,
        sessionId,
        timestamp: point.timestamp ? new Date(point.timestamp) : new Date()
      }));

      // 使用 createMany 批量插入
      await db.simulationData.createMany({ data });
      
      // 返回插入的数据
      return await db.simulationData.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'desc' },
        take: dataPoints.length
      });
    } catch (error) {
      throw error;
    }
  }

  // 添加测试数据
  static async addTestData(sessionId: string, dataPoints: Omit<TestData, 'id' | 'sessionId' | 'createdAt'>[]): Promise<TestData[]> {
    try {
      const data = dataPoints.map(point => ({
        ...point,
        sessionId,
        measurementTimestamp: new Date(point.measurementTimestamp)
      }));

      await db.testData.createMany({ data });
      
      return await db.testData.findMany({
        where: { sessionId },
        orderBy: { measurementTimestamp: 'desc' },
        take: dataPoints.length
      });
    } catch (error) {
      throw error;
    }
  }

  // 获取会话的仿真数据
  static async getSimulationData(sessionId: string): Promise<SimulationData[]> {
    try {
      return await db.simulationData.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'asc' }
      });
    } catch (error) {
      throw error;
    }
  }

  // 获取会话的测试数据
  static async getTestData(sessionId: string): Promise<TestData[]> {
    try {
      return await db.testData.findMany({
        where: { sessionId },
        orderBy: { measurementTimestamp: 'asc' }
      });
    } catch (error) {
      throw error;
    }
  }

  // 执行数据对比分析
  static async performDataComparison(sessionId: string): Promise<DataComparison[]> {
    try {
      // 获取仿真数据和测试数据
      const [simulationData, testData] = await Promise.all([
        this.getSimulationData(sessionId),
        this.getTestData(sessionId)
      ]);

      const comparisons: Omit<DataComparison, 'id' | 'createdAt'>[] = [];

      // 对每个参数进行对比
      const parameters = new Set([
        ...simulationData.map(d => d.parameterName),
        ...testData.map(d => d.parameterName)
      ]);

      for (const parameterName of parameters) {
        const simData = simulationData.find(d => d.parameterName === parameterName);
        const testDataPoint = testData.find(d => d.parameterName === parameterName);

        if (simData && testDataPoint) {
          const simulationValue = simData.parameterValue;
          const testValue = testDataPoint.parameterValue;
          const absoluteError = Math.abs(testValue - simulationValue);
          const relativeErrorPercent = (absoluteError / Math.abs(simulationValue)) * 100;
          
          // 简单的容差检查
          const toleranceMet = relativeErrorPercent <= 10; // 10% 容差

          comparisons.push({
            sessionId,
            parameterName,
            simulationValue,
            testValue,
            unit: simData.unit,
            absoluteError,
            relativeErrorPercent,
            toleranceMet
          });
        }
      }

      // 保存对比结果
      if (comparisons.length > 0) {
        await db.dataComparison.createMany({ data: comparisons });
      }

      return await this.getDataComparisons(sessionId);
    } catch (error) {
      throw error;
    }
  }

  // 获取数据对比结果
  static async getDataComparisons(sessionId: string): Promise<DataComparison[]> {
    try {
      return await db.dataComparison.findMany({
        where: { sessionId },
        orderBy: { parameterName: 'asc' }
      });
    } catch (error) {
      throw error;
    }
  }

  // 删除测试会话
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      await db.testSession.delete({
        where: { id: sessionId }
      });
    } catch (error) {
      throw error;
    }
  }

  // 获取测试统计信息
  static async getTestStatistics() {
    try {
      const [totalSessions, sessionsByStatus, comparisons] = await Promise.all([
        db.testSession.count(),
        db.testSession.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        db.dataComparison.findMany({
          select: { relativeErrorPercent: true }
        })
      ]);

      const statusCounts = sessionsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>);

      const averageError = comparisons.length > 0 
        ? comparisons.reduce((sum, comp) => sum + comp.relativeErrorPercent, 0) / comparisons.length
        : 0;

      return {
        totalSessions,
        sessionsByStatus: statusCounts,
        averageRelativeError: averageError,
        totalComparisons: comparisons.length
      };
    } catch (error) {
      throw error;
    }
  }
}