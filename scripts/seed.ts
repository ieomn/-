/**
 * 数据库种子脚本
 * 用于生成基础数据
 */

import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 开始种子数据生成...')

  // 清空现有数据（保持外键约束顺序）
  await db.systemStatistic.deleteMany()
  await db.analysisResult.deleteMany()
  await db.dataComparison.deleteMany()
  await db.testData.deleteMany()
  await db.simulationData.deleteMany()
  await db.uploadedFile.deleteMany()
  await db.testSession.deleteMany()
  await db.machineComponent.deleteMany()
  await db.machineModel.deleteMany()
  await db.machineCategory.deleteMany()
  await db.userProfile.deleteMany()

  // 创建机床类别
  const latheCategory = await db.machineCategory.create({
    data: {
      name: '车床',
      code: 'lathe',
      description: '数控车床设备，用于回转体零件的加工'
    }
  })

  const millCategory = await db.machineCategory.create({
    data: {
      name: '铣床',
      code: 'mill',
      description: '数控铣床设备，用于复杂零件的铣削加工'
    }
  })

  const drillingCategory = await db.machineCategory.create({
    data: {
      name: '钻床',
      code: 'drilling',
      description: '钻床设备，用于钻孔、扩孔、铰孔等加工'
    }
  })

  console.log('✅ 机床类别创建完成')

  // 创建车床型号
  const ck6140v2 = await db.machineModel.create({
    data: {
      categoryId: latheCategory.id,
      name: 'CK6140-V2',
      code: 'ck6140-v2',
      description: '高精度数控车床，适用于复杂回转体零件加工',
      specifications: JSON.stringify({
        maxTurningDiameter: 400,
        maxTurningLength: 1000,
        spindleSpeed: '10-4000 rpm',
        feedRate: '0.01-15 m/min',
        accuracy: '±0.005mm'
      }),
      status: 'ACTIVE'
    }
  })

  const ck6150 = await db.machineModel.create({
    data: {
      categoryId: latheCategory.id,
      name: 'CK6150',
      code: 'ck6150',
      description: '中型数控车床，生产效率高',
      specifications: JSON.stringify({
        maxTurningDiameter: 500,
        maxTurningLength: 1500,
        spindleSpeed: '10-3000 rpm',
        feedRate: '0.01-12 m/min',
        accuracy: '±0.008mm'
      }),
      status: 'ACTIVE'
    }
  })

  const ck6132 = await db.machineModel.create({
    data: {
      categoryId: latheCategory.id,
      name: 'CK6132',
      code: 'ck6132',
      description: '紧凑型数控车床，适合小批量生产',
      specifications: JSON.stringify({
        maxTurningDiameter: 320,
        maxTurningLength: 750,
        spindleSpeed: '50-4000 rpm',
        feedRate: '0.01-10 m/min',
        accuracy: '±0.005mm'
      }),
      status: 'ACTIVE'
    }
  })

  // 创建铣床型号
  const xk714 = await db.machineModel.create({
    data: {
      categoryId: millCategory.id,
      name: 'XK714',
      code: 'xk714',
      description: '立式数控铣床，适用于复杂零件加工',
      specifications: JSON.stringify({
        workTableSize: '500×180 mm',
        spindleSpeed: '50-8000 rpm',
        feedRate: '1-8000 mm/min',
        positioningAccuracy: '±0.005mm',
        repeatAccuracy: '±0.003mm'
      }),
      status: 'ACTIVE'
    }
  })

  const xk7136 = await db.machineModel.create({
    data: {
      categoryId: millCategory.id,
      name: 'XK7136',
      code: 'xk7136',
      description: '大型立式数控铣床，高刚性设计',
      specifications: JSON.stringify({
        workTableSize: '800×360 mm',
        spindleSpeed: '20-6000 rpm',
        feedRate: '1-6000 mm/min',
        positioningAccuracy: '±0.008mm',
        repeatAccuracy: '±0.005mm'
      }),
      status: 'ACTIVE'
    }
  })

  const xk7125 = await db.machineModel.create({
    data: {
      categoryId: millCategory.id,
      name: 'XK7125',
      code: 'xk7125',
      description: '中小型立式数控铣床，操作简便',
      specifications: JSON.stringify({
        workTableSize: '320×125 mm',
        spindleSpeed: '100-8000 rpm',
        feedRate: '1-5000 mm/min',
        positioningAccuracy: '±0.006mm',
        repeatAccuracy: '±0.004mm'
      }),
      status: 'ACTIVE'
    }
  })

  console.log('✅ 机床型号创建完成')

  // 创建车床组件
  const spindleBoxCK6140 = await db.machineComponent.create({
    data: {
      modelId: ck6140v2.id,
      name: '主轴箱',
      code: 'spindle-box',
      description: '主轴箱总成，包含主轴、轴承系统等',
      parameters: JSON.stringify({
        maxSpeed: 4000,
        power: '7.5 kW',
        bearingType: '高精度角接触球轴承',
        coolingType: '强制循环冷却'
      })
    }
  })

  const bedCK6140 = await db.machineComponent.create({
    data: {
      modelId: ck6140v2.id,
      name: '床身',
      code: 'bed',
      description: '机床床身，提供刚性支撑',
      parameters: JSON.stringify({
        material: 'HT300铸铁',
        thermalTreatment: '人工时效处理',
        guidewayType: '线性导轨',
        dampingRatio: 0.05
      })
    }
  })

  const toolRestCK6140 = await db.machineComponent.create({
    data: {
      modelId: ck6140v2.id,
      name: '刀架',
      code: 'tool-rest',
      description: '电动刀架，自动换刀',
      parameters: JSON.stringify({
        toolPositions: 8,
        indexingAccuracy: '±5"',
        clampingForce: '1500 N',
        indexingTime: '1.5 s'
      })
    }
  })

  const tailstockCK6140 = await db.machineComponent.create({
    data: {
      modelId: ck6140v2.id,
      name: '尾座',
      code: 'tailstock',
      description: '液压尾座，用于支撑长工件',
      parameters: JSON.stringify({
        travel: '150 mm',
        taperSize: 'MT4',
        clampingForce: '2000 N',
        positioningAccuracy: '±0.02 mm'
      })
    }
  })

  // 为其他车床创建主要组件
  await db.machineComponent.createMany({
    data: [
      // CK6150 组件
      {
        modelId: ck6150.id,
        name: '主轴箱',
        code: 'spindle-box',
        description: '主轴箱总成',
        parameters: JSON.stringify({ maxSpeed: 3000, power: '11 kW' })
      },
      {
        modelId: ck6150.id,
        name: '床身',
        code: 'bed',
        description: '机床床身',
        parameters: JSON.stringify({ material: 'HT300铸铁', guidewayType: '线性导轨' })
      },
      // CK6132 组件
      {
        modelId: ck6132.id,
        name: '主轴箱',
        code: 'spindle-box',
        description: '主轴箱总成',
        parameters: JSON.stringify({ maxSpeed: 4000, power: '5.5 kW' })
      },
      {
        modelId: ck6132.id,
        name: '刀架',
        code: 'tool-rest',
        description: '电动刀架',
        parameters: JSON.stringify({ toolPositions: 6, indexingTime: '1.2 s' })
      }
    ]
  })

  // 创建铣床组件
  await db.machineComponent.createMany({
    data: [
      // XK714 组件
      {
        modelId: xk714.id,
        name: '主轴',
        code: 'spindle',
        description: '立式主轴',
        parameters: JSON.stringify({ maxSpeed: 8000, power: '4 kW', toolHolderType: 'BT40' })
      },
      {
        modelId: xk714.id,
        name: '工作台',
        code: 'workbench',
        description: 'X-Y工作台',
        parameters: JSON.stringify({ size: '500×180 mm', maxLoad: '200 kg' })
      },
      {
        modelId: xk714.id,
        name: 'Z轴立柱',
        code: 'z-column',
        description: 'Z轴运动立柱',
        parameters: JSON.stringify({ travel: '400 mm', feedRate: '1-8000 mm/min' })
      },
      // XK7136 组件
      {
        modelId: xk7136.id,
        name: '主轴',
        code: 'spindle',
        description: '立式主轴',
        parameters: JSON.stringify({ maxSpeed: 6000, power: '7.5 kW', toolHolderType: 'BT40' })
      },
      {
        modelId: xk7136.id,
        name: '工作台',
        code: 'workbench',
        description: 'X-Y工作台',
        parameters: JSON.stringify({ size: '800×360 mm', maxLoad: '500 kg' })
      },
      // XK7125 组件
      {
        modelId: xk7125.id,
        name: '主轴',
        code: 'spindle',
        description: '立式主轴',
        parameters: JSON.stringify({ maxSpeed: 8000, power: '3 kW', toolHolderType: 'BT30' })
      },
      {
        modelId: xk7125.id,
        name: '工作台',
        code: 'workbench',
        description: 'X-Y工作台',
        parameters: JSON.stringify({ size: '320×125 mm', maxLoad: '150 kg' })
      }
    ]
  })

  console.log('✅ 机床组件创建完成')

  // 创建用户档案
  const adminUser = await db.userProfile.create({
    data: {
      email: 'admin@machine-nexus.com',
      fullName: '系统管理员',
      role: 'ADMIN',
      department: '技术部'
    }
  })

  const engineerUser = await db.userProfile.create({
    data: {
      email: 'engineer@machine-nexus.com',
      fullName: '李工程师',
      role: 'ENGINEER',
      department: '研发部'
    }
  })

  const operatorUser = await db.userProfile.create({
    data: {
      email: 'operator@machine-nexus.com',
      fullName: '王操作员',
      role: 'OPERATOR',
      department: '生产部'
    }
  })

  console.log('✅ 用户档案创建完成')

  // 创建系统统计指标
  await db.systemStatistic.createMany({
    data: [
      {
        metricName: 'total_test_records',
        metricValue: 0,
        metricType: 'COUNT'
      },
      {
        metricName: 'completed_analyses',
        metricValue: 0,
        metricType: 'COUNT'
      },
      {
        metricName: 'average_error_rate',
        metricValue: 0,
        metricType: 'PERCENTAGE'
      },
      {
        metricName: 'active_machines',
        metricValue: 6,
        metricType: 'COUNT'
      }
    ]
  })

  console.log('✅ 系统统计指标创建完成')

  console.log('🎉 种子数据生成完成！')
  console.log(`
📊 生成的数据统计:
- 机床类别: 3 个
- 机床型号: 6 个
- 机床组件: ${await db.machineComponent.count()} 个
- 用户档案: 3 个
- 系统指标: 4 个
  `)
}

main()
  .catch((error) => {
    console.error('❌ 种子数据生成失败:', error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })