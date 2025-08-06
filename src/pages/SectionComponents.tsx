import { useParams, NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Settings, Wrench, Box } from "lucide-react";

// 各个部分的组件数据
const sectionComponents = {
  "structure": {
    name: "结构件",
    description: "机床的主要结构组成部分，包括床身、主轴箱、刀塔等关键结构",
    icon: Box,
    lathe: {
      "ck6140-v2": [
        { id: "spindle-box", name: "主轴箱", description: "主轴及其支撑结构", status: "已测试" },
        { id: "bed", name: "床身", description: "机床基础结构", status: "测试中" },
        { id: "turret", name: "刀塔", description: "刀具更换装置", status: "待测试" }
      ],
      "ck6150": [
        { id: "spindle-box", name: "主轴箱", description: "主轴及其支撑结构", status: "已测试" },
        { id: "bed", name: "床身", description: "机床基础结构", status: "已测试" }
      ]
    },
    mill: {
      "xk714": [
        { id: "spindle-box", name: "主轴箱", description: "铣床主轴结构", status: "已测试" },
        { id: "worktable", name: "工作台", description: "工件装夹平台", status: "测试中" },
        { id: "column", name: "立柱", description: "支撑结构", status: "待测试" }
      ]
    }
  },
  "functional": {
    name: "功能部件",
    description: "实现机床各种功能的部件，包括进给系统、传动系统等",
    icon: Settings,
    lathe: {
      "ck6140-v2": [
        { id: "feed-system", name: "进给系统", description: "X/Z轴进给机构", status: "已测试" },
        { id: "main-drive", name: "主传动", description: "主轴驱动系统", status: "测试中" },
        { id: "hydraulic", name: "液压系统", description: "液压动力系统", status: "待测试" }
      ],
      "ck6150": [
        { id: "feed-system", name: "进给系统", description: "X/Z轴进给机构", status: "已测试" },
        { id: "main-drive", name: "主传动", description: "主轴驱动系统", status: "已测试" }
      ]
    },
    mill: {
      "xk714": [
        { id: "spindle-drive", name: "主轴驱动", description: "主轴电机及传动", status: "已测试" },
        { id: "feed-system", name: "进给系统", description: "三轴进给机构", status: "测试中" },
        { id: "tool-changer", name: "换刀装置", description: "自动换刀系统", status: "待测试" }
      ]
    }
  },
  "static": {
    name: "静结合部",
    description: "机床中不发生相对运动的连接部位",
    icon: Wrench,
    lathe: {
      "ck6140-v2": [
        { id: "guide-joint", name: "导轨结合部", description: "导轨与床身连接", status: "已测试" },
        { id: "spindle-bearing", name: "主轴轴承座", description: "主轴轴承安装部位", status: "测试中" }
      ]
    },
    mill: {
      "xk714": [
        { id: "guide-joint", name: "导轨结合部", description: "导轨与机身连接", status: "已测试" }
      ]
    }
  },
  "dynamic": {
    name: "动结合部", 
    description: "机床中发生相对运动的连接部位",
    icon: Settings,
    lathe: {
      "ck6140-v2": [
        { id: "spindle-bearing", name: "主轴轴承", description: "主轴旋转轴承", status: "已测试" },
        { id: "ball-screw", name: "滚珠丝杠", description: "进给传动丝杠", status: "测试中" }
      ]
    },
    mill: {
      "xk714": [
        { id: "spindle-bearing", name: "主轴轴承", description: "主轴旋转轴承", status: "已测试" }
      ]
    }
  }
};

export const SectionComponents = () => {
  const { category, model, section } = useParams();
  
  const sectionData = sectionComponents[section as keyof typeof sectionComponents];
  const components = sectionData?.[category as keyof typeof sectionData]?.[model as string] || [];

  if (!sectionData) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-foreground">未找到部分信息</h1>
      </div>
    );
  }

  const SectionIcon = sectionData.icon;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{category === 'lathe' ? '车床' : '铣床'}</Badge>
          <span className="text-muted-foreground">•</span>
          <Badge variant="outline">{model?.toUpperCase()}</Badge>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">组件列表</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <SectionIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">{sectionData.name}</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-4xl">
          {sectionData.description}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总组件数</CardTitle>
            <SectionIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{components.length}</div>
            <p className="text-xs text-muted-foreground">个组件</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成测试</CardTitle>
            <div className="h-4 w-4 rounded-full bg-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {components.filter(c => c.status === "已测试").length}
            </div>
            <p className="text-xs text-muted-foreground">个组件</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">测试中</CardTitle>
            <div className="h-4 w-4 rounded-full bg-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {components.filter(c => c.status === "测试中").length}
            </div>
            <p className="text-xs text-muted-foreground">个组件</p>
          </CardContent>
        </Card>
      </div>

      {/* 组件列表 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">组件列表</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((component, index) => (
            <Card key={component.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in hover-scale" style={{animationDelay: `${index * 100}ms`}}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <Badge variant={
                    component.status === "已测试" ? "default" : 
                    component.status === "测试中" ? "secondary" : "outline"
                  }>
                    {component.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {component.description}
                </p>
                <Button asChild className="w-full">
                  <NavLink to={`/analysis/${category}/${model}/${section}/${component.id}`}>
                    <span>进入数据分析</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </NavLink>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 如果没有组件 */}
      {components.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <SectionIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无组件数据</h3>
            <p className="text-muted-foreground">
              该部分的组件数据正在整理中，请稍后查看
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};