import { db } from '@/lib/db';
import { MachineService } from '@/lib/api';

export class DemoDataGenerator {
  // 生成演示测试数据
  static async generateDemoTestData(sessionId: string, componentType: string = 'spindle-box') {
    const simulationData = this.getSimulationDataForComponent(componentType);
    const testData = this.generateTestDataFromSimulation(simulationData);

    try {
      // 添加仿真数据
      await db.simulationData.createMany({
        data: simulationData.map(data => ({
          sessionId,
          parameterName: data.parameter_name,
          parameterValue: data.parameter_value,
          unit: data.unit,
          timestamp: new Date(data.timestamp),
          metadata: JSON.stringify(data.metadata)
        }))
      });
      
      // 添加测试数据（带一些随机误差）
      await db.testData.createMany({
        data: testData.map(data => ({
          sessionId,
          parameterName: data.parameter_name,
          parameterValue: data.parameter_value,
          unit: data.unit,
          measurementTimestamp: new Date(data.measurement_timestamp),
          measurementConditions: JSON.stringify(data.measurement_conditions),
          accuracyGrade: data.accuracy_grade
        }))
      });
      
      // 执行数据对比
      await this.performDataComparison(sessionId);
      
      console.log('Demo test data generated successfully');
    } catch (error) {
      console.error('Error generating demo test data:', error);
      throw error;
    }
  }

  // 为不同组件生成仿真数据
  private static getSimulationDataForComponent(componentType: string) {
    const baseTimestamp = new Date().toISOString();
    
    const componentData = {
      'spindle-box': [
        { parameter_name: '最大转速', parameter_value: 4000, unit: 'rpm' },
        { parameter_name: '振动位移', parameter_value: 0.025, unit: 'mm' },
        { parameter_name: '工作温度', parameter_value: 42.5, unit: '°C' },
        { parameter_name: '噪音水平', parameter_value: 68.2, unit: 'dB' },
        { parameter_name: '动刚度', parameter_value: 156.8, unit: 'N/μm' }
      ],
      'bed': [
        { parameter_name: '静刚度', parameter_value: 285.4, unit: 'N/μm' },
        { parameter_name: '阻尼比', parameter_value: 0.032, unit: '' },
        { parameter_name: '固有频率', parameter_value: 156.7, unit: 'Hz' },
        { parameter_name: '最大变形', parameter_value: 0.018, unit: 'mm' },
        { parameter_name: '等效应力', parameter_value: 145.6, unit: 'MPa' }
      ],
      'tool-turret': [
        { parameter_name: '定位精度', parameter_value: 0.005, unit: 'mm' },
        { parameter_name: '夹紧力', parameter_value: 15000, unit: 'N' },
        { parameter_name: '换刀时间', parameter_value: 3.2, unit: 's' },
        { parameter_name: '重复精度', parameter_value: 0.002, unit: 'mm' }
      ],
      'spindle': [
        { parameter_name: '最大转速', parameter_value: 8000, unit: 'rpm' },
        { parameter_name: '最大扭矩', parameter_value: 500, unit: 'Nm' },
        { parameter_name: '功率', parameter_value: 7.5, unit: 'kW' },
        { parameter_name: '主轴跳动', parameter_value: 0.003, unit: 'mm' }
      ]
    };

    const selectedData = componentData[componentType] || componentData['spindle-box'];
    
    return selectedData.map(data => ({
      ...data,
      timestamp: baseTimestamp,
      metadata: { source: 'simulation', component: componentType }
    }));
  }

  // 从仿真数据生成测试数据（添加随机误差）
  private static generateTestDataFromSimulation(simulationData: any[]) {
    const baseTimestamp = new Date();
    baseTimestamp.setMinutes(baseTimestamp.getMinutes() + 30); // 测试时间晚于仿真时间

    return simulationData.map(simData => {
      // 添加 ±5% 的随机误差
      const errorFactor = 1 + (Math.random() - 0.5) * 0.1; // ±5%
      const testValue = simData.parameter_value * errorFactor;
      
      return {
        parameter_name: simData.parameter_name,
        parameter_value: Number(testValue.toFixed(3)),
        unit: simData.unit,
        measurement_timestamp: baseTimestamp.toISOString(),
        measurement_conditions: {
          temperature: 23 + Math.random() * 2, // 23-25°C
          humidity: 45 + Math.random() * 10,   // 45-55%
          pressure: 1013 + Math.random() * 5   // 1013-1018 hPa
        },
        accuracy_grade: 'A级'
      };
    });
  }

  // 执行数据对比分析
  private static async performDataComparison(sessionId: string) {
    // 获取仿真数据和测试数据
    const [simulationData, testData] = await Promise.all([
      db.simulationData.findMany({ where: { sessionId } }),
      db.testData.findMany({ where: { sessionId } })
    ]);

    const comparisons = [];

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
        
        // 简单的容差检查（可以根据参数类型定制）
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
      await db.dataComparison.createMany({
        data: comparisons
      });
    }
  }

  // 生成演示分析数据
  static async generateDemoAnalysis(sessionId: string) {
    try {
      // 创建分析结果
      await db.analysisResult.create({
        data: {
          sessionId,
          analysisType: 'COMPARISON',
                           results: JSON.stringify({
                   summary: {
                     totalParameters: 5,
                     withinTolerance: 4,
                     averageError: 3.2
                   }
                 }),
          summary: '对比分析完成，大部分参数在容差范围内',
          conclusions: '测试结果与仿真结果基本一致',
          recommendations: '建议继续监控关键参数',
          confidenceLevel: 0.95
        }
      });
      
      console.log('Demo analysis data generated successfully');
    } catch (error) {
      console.error('Error generating demo analysis:', error);
      throw error;
    }
  }

  // 创建演示测试会话
  static async createDemoSession(modelCode: string, componentCode: string) {
    try {
      // 获取模型和组件信息
      const model = await MachineService.getModelDetails(modelCode);
      if (!model) throw new Error(`Model ${modelCode} not found`);
      
      const component = model.components.find(c => c.code === componentCode);
      if (!component) throw new Error(`Component ${componentCode} not found in model ${modelCode}`);
      
      // 创建测试会话
      const session = await db.testSession.create({
        data: {
          modelId: model.id,
          componentId: component.id,
          sessionName: `${model.name} - ${component.name} 演示测试`,
          description: `自动生成的演示测试会话，用于展示系统功能`,
          testType: 'PERFORMANCE',
          status: 'RUNNING',
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前开始
        }
      });
      
      // 生成测试数据
      await this.generateDemoTestData(session.id, componentCode);
      
      // 生成分析数据
      await this.generateDemoAnalysis(session.id);
      
      // 更新会话状态为完成
      await db.testSession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });
      
      console.log('Demo session created successfully:', session.id);
      return session;
    } catch (error) {
      console.error('Error creating demo session:', error);
      throw error;
    }
  }

  // 生成多个演示会话
  static async generateMultipleDemoSessions() {
    const sessionsToCreate = [
      { model: 'ck6140-v2', component: 'spindle-box' },
      { model: 'ck6140-v2', component: 'bed' },
      { model: 'ck6150', component: 'spindle-box' },
      { model: 'xk714', component: 'spindle' },
      { model: 'xk714', component: 'worktable' }
    ];

    const results = [];
    
    for (const sessionConfig of sessionsToCreate) {
      try {
        const session = await this.createDemoSession(sessionConfig.model, sessionConfig.component);
        results.push(session);
        
        // 添加延迟避免过快创建
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to create demo session for ${sessionConfig.model}-${sessionConfig.component}:`, error);
      }
    }
    
    console.log(`Created ${results.length} demo sessions`);
    return results;
  }

  // 清理演示数据
  static async cleanupDemoData() {
    try {
      // 获取所有演示会话（名称包含"演示"的会话）
      const demoSessions = await db.testSession.findMany({
        where: {
          sessionName: {
            contains: '演示'
          }
        }
      });
      
      for (const session of demoSessions) {
        await db.testSession.delete({
          where: { id: session.id }
        });
      }
      
      console.log(`Cleaned up ${demoSessions.length} demo sessions`);
    } catch (error) {
      console.error('Error cleaning up demo data:', error);
      throw error;
    }
  }

  // 生成随机时间序列数据（用于趋势分析）
  static async generateTimeSeriesData(sessionId: string, days: number = 30) {
    const dataPoints = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const parameters = [
      { name: '温度', baseValue: 42.5, unit: '°C', variance: 2 },
      { name: '振动', baseValue: 0.025, unit: 'mm', variance: 0.005 },
      { name: '转速', baseValue: 4000, unit: 'rpm', variance: 100 }
    ];
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      for (const param of parameters) {
        // 添加一些趋势和随机变化
        const trendFactor = 1 + (i / days) * 0.1; // 10%的上升趋势
        const randomFactor = 1 + (Math.random() - 0.5) * (param.variance / param.baseValue);
        const value = param.baseValue * trendFactor * randomFactor;
        
        dataPoints.push({
          parameter_name: param.name,
          parameter_value: Number(value.toFixed(3)),
          unit: param.unit,
          measurement_timestamp: currentDate.toISOString(),
          measurement_conditions: {
            day: i + 1,
            temperature: 23 + Math.random() * 2
          },
          accuracy_grade: 'A级'
        });
      }
    }
    
    try {
      await db.testData.createMany({
        data: dataPoints.map(point => ({
          sessionId,
          parameterName: point.parameter_name,
          parameterValue: point.parameter_value,
          unit: point.unit,
          measurementTimestamp: new Date(point.measurement_timestamp),
          measurementConditions: point.measurement_conditions,
          accuracyGrade: point.accuracy_grade
        }))
      });
      console.log(`Generated ${dataPoints.length} time series data points`);
    } catch (error) {
      console.error('Error generating time series data:', error);
      throw error;
    }
  }
}