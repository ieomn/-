import { db } from '@/lib/db';
import type { MachineCategory, MachineModel, MachineComponent } from '@prisma/client';

export interface MachineModelWithDetails extends MachineModel {
  category: MachineCategory;
  components: MachineComponent[];
}

export class MachineService {
  // 获取所有机床类别
  static async getCategories(): Promise<MachineCategory[]> {
    return await db.machineCategory.findMany({
      orderBy: { name: 'asc' }
    });
  }

  // 根据类别获取机床型号
  static async getModelsByCategory(categoryCode: string): Promise<MachineModelWithDetails[]> {
    return await db.machineModel.findMany({
      where: {
        category: { code: categoryCode },
        status: 'ACTIVE'
      },
      include: {
        category: true,
        components: true
      },
      orderBy: { name: 'asc' }
    });
  }

  // 获取特定机床型号详情
  static async getModelDetails(modelCode: string): Promise<MachineModelWithDetails | null> {
    return await db.machineModel.findFirst({
      where: { code: modelCode },
      include: {
        category: true,
        components: true
      }
    });
  }

  // 获取机床组件详情
  static async getComponentDetails(modelCode: string, componentCode: string): Promise<MachineComponent | null> {
    return await db.machineComponent.findFirst({
      where: {
        code: componentCode,
        model: { code: modelCode }
      }
    });
  }

  // 创建新的机床型号
  static async createModel(model: Omit<MachineModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<MachineModel> {
    return await db.machineModel.create({
      data: model
    });
  }

  // 更新机床型号
  static async updateModel(id: string, updates: Partial<Omit<MachineModel, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MachineModel> {
    return await db.machineModel.update({
      where: { id },
      data: updates
    });
  }

  // 删除机床型号
  static async deleteModel(id: string): Promise<void> {
    await db.machineModel.delete({
      where: { id }
    });
  }

  // 创建机床组件
  static async createComponent(component: Omit<MachineComponent, 'id' | 'createdAt' | 'updatedAt'>): Promise<MachineComponent> {
    return await db.machineComponent.create({
      data: component
    });
  }

  // 更新机床组件
  static async updateComponent(id: string, updates: Partial<Omit<MachineComponent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MachineComponent> {
    return await db.machineComponent.update({
      where: { id },
      data: updates
    });
  }

  // 获取机床统计信息
  static async getMachineStatistics() {
    const [totalCategories, totalModels, totalComponents] = await Promise.all([
      db.machineCategory.count(),
      db.machineModel.count({ where: { status: 'ACTIVE' } }),
      db.machineComponent.count()
    ]);

    return {
      totalCategories,
      totalModels,
      totalComponents
    };
  }
}