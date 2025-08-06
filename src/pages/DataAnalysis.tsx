import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileImage, Video, FileText, BarChart3, LineChart } from "lucide-react";
import { BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 不同组件的专门数据配置
const componentAnalysisData = {
  "spindle-box": {
    name: "主轴箱",
    description: "主轴箱的动态特性分析，包括振动、温度和转速特性",
    simulationParams: {
      maxSpeed: 4000,        // 最大转速 (rpm)
      vibration: 0.025,      // 振动位移 (mm)
      temperature: 42.5,     // 工作温度 (°C)
      noise: 68.2,           // 噪音水平 (dB)
      stiffness: 156.8       // 刚度 (N/μm)
    },
    testParams: [
      { name: "最大转速", unit: "rpm", key: "maxSpeed" },
      { name: "振动位移", unit: "mm", key: "vibration" },
      { name: "工作温度", unit: "°C", key: "temperature" },
      { name: "噪音水平", unit: "dB", key: "noise" },
      { name: "动刚度", unit: "N/μm", key: "stiffness" }
    ],
    chartLabels: ["转速", "振动", "温度", "噪音", "刚度"]
  },
  "bed": {
    name: "床身",
    description: "床身结构的静态和动态特性分析",
    simulationParams: {
      staticStiffness: 285.4,  // 静刚度 (N/μm)
      damping: 0.032,          // 阻尼比
      naturalFreq: 156.7,      // 固有频率 (Hz)
      deformation: 0.018,      // 变形量 (mm)
      stress: 145.6            // 应力 (MPa)
    },
    testParams: [
      { name: "静刚度", unit: "N/μm", key: "staticStiffness" },
      { name: "阻尼比", unit: "", key: "damping" },
      { name: "固有频率", unit: "Hz", key: "naturalFreq" },
      { name: "最大变形", unit: "mm", key: "deformation" },
      { name: "等效应力", unit: "MPa", key: "stress" }
    ],
    chartLabels: ["静刚度", "阻尼", "频率", "变形", "应力"]
  },
  "feed-system": {
    name: "进给系统",
    description: "进给系统的精度和动态响应分析",
    simulationParams: {
      positioning: 0.005,      // 定位精度 (mm)
      repeatability: 0.003,    // 重复精度 (mm)
      feedRate: 15.0,          // 最大进给速度 (m/min)
      acceleration: 2.5,       // 加速度 (m/s²)
      backlash: 0.008          // 反向间隙 (mm)
    },
    testParams: [
      { name: "定位精度", unit: "mm", key: "positioning" },
      { name: "重复精度", unit: "mm", key: "repeatability" },
      { name: "最大进给", unit: "m/min", key: "feedRate" },
      { name: "加速度", unit: "m/s²", key: "acceleration" },
      { name: "反向间隙", unit: "mm", key: "backlash" }
    ],
    chartLabels: ["定位精度", "重复精度", "进给速度", "加速度", "间隙"]
  },
  "main-drive": {
    name: "主传动",
    description: "主传动系统的功率传递和效率分析",
    simulationParams: {
      power: 7.5,              // 额定功率 (kW)
      torque: 18.2,            // 最大转矩 (Nm)
      efficiency: 0.92,        // 传动效率
      speedRange: 4000,        // 调速范围 (rpm)
      vibration: 0.015         // 传动振动 (mm)
    },
    testParams: [
      { name: "额定功率", unit: "kW", key: "power" },
      { name: "最大转矩", unit: "Nm", key: "torque" },
      { name: "传动效率", unit: "", key: "efficiency" },
      { name: "调速范围", unit: "rpm", key: "speedRange" },
      { name: "传动振动", unit: "mm", key: "vibration" }
    ],
    chartLabels: ["功率", "转矩", "效率", "调速", "振动"]
  },
  "worktable": {
    name: "工作台",
    description: "工作台的承载能力和定位精度分析",
    simulationParams: {
      loadCapacity: 500,       // 承载能力 (kg)
      flatness: 0.008,         // 平面度 (mm)
      positioning: 0.01,       // 定位精度 (mm)
      rigidity: 245.6,         // 刚性 (N/μm)
      thermalStability: 0.005  // 热稳定性 (mm/°C)
    },
    testParams: [
      { name: "承载能力", unit: "kg", key: "loadCapacity" },
      { name: "平面度", unit: "mm", key: "flatness" },
      { name: "定位精度", unit: "mm", key: "positioning" },
      { name: "刚性", unit: "N/μm", key: "rigidity" },
      { name: "热稳定性", unit: "mm/°C", key: "thermalStability" }
    ],
    chartLabels: ["承载", "平面度", "定位", "刚性", "热稳定"]
  },
  "spindle-drive": {
    name: "主轴驱动",
    description: "主轴驱动系统的动态响应和控制精度分析",
    simulationParams: {
      ratedPower: 11.0,        // 额定功率 (kW)
      maxSpeed: 6000,          // 最大转速 (rpm)
      speedStability: 0.2,     // 速度稳定性 (%)
      responseTime: 0.15,      // 响应时间 (s)
      controlAccuracy: 0.1     // 控制精度 (%)
    },
    testParams: [
      { name: "额定功率", unit: "kW", key: "ratedPower" },
      { name: "最大转速", unit: "rpm", key: "maxSpeed" },
      { name: "速度稳定性", unit: "%", key: "speedStability" },
      { name: "响应时间", unit: "s", key: "responseTime" },
      { name: "控制精度", unit: "%", key: "controlAccuracy" }
    ],
    chartLabels: ["功率", "转速", "稳定性", "响应", "精度"]
  }
};

// 生成测试数据
const generateTestData = (component: string, baseData: any) => {
  const variance = 0.05 + Math.random() * 0.1; // 5-15%的随机偏差
  const testData: any[] = [];
  
  for (let i = 1; i <= 2; i++) {
    const machineData: any = {};
    Object.keys(baseData).forEach(key => {
      const deviation = (Math.random() - 0.5) * 2 * variance;
      machineData[key] = baseData[key] * (1 + deviation);
    });
    testData.push({
      name: `测试机${i}`,
      data: machineData
    });
  }
  return testData;
};

// 生成图表数据
const generateChartData = (component: string, simulationData: any, testData: any[], labels: string[]) => {
  const params = Object.keys(simulationData);
  return params.map((param, index) => ({
    name: labels[index] || param,
    仿真值: Number(simulationData[param].toFixed(3)),
    测试值1: Number(testData[0]?.data[param]?.toFixed(3) || 0),
    测试值2: Number(testData[1]?.data[param]?.toFixed(3) || 0)
  }));
};

export const DataAnalysis = () => {
  const { category, model, section, component } = useParams();
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>(["simulation", "test1"]);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // 获取组件特定的分析数据
  const analysisConfig = componentAnalysisData[component as keyof typeof componentAnalysisData];
  
  if (!analysisConfig) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-foreground">未找到组件分析配置</h1>
      </div>
    );
  }

  // 生成该组件的测试数据和图表数据
  const simulationData = analysisConfig.simulationParams;
  const testData = generateTestData(component || '', simulationData);
  const chartData = generateChartData(component || '', simulationData, testData, analysisConfig.chartLabels);

  const componentName = analysisConfig.name;
  const sectionName = section === "structure" ? "结构件" : 
                     section === "functional" ? "功能部件" :
                     section === "static" ? "静结合部" :
                     section === "dynamic" ? "动结合部" : "整机";

  const calculateError = (simulation: number, test: number) => {
    return ((Math.abs(test - simulation) / simulation) * 100).toFixed(2);
  };

  const handleDatasetChange = (dataset: string, checked: boolean) => {
    if (checked) {
      setSelectedDatasets([...selectedDatasets, dataset]);
    } else {
      setSelectedDatasets(selectedDatasets.filter(d => d !== dataset));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{sectionName}</Badge>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">性能分析</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {componentName} - 数据分析
        </h1>
        <p className="text-muted-foreground max-w-4xl">
          {analysisConfig.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 数据输入区 */}
        <div className="space-y-6">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>数据输入区</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 虚拟样机参数 */}
              <div>
                <h3 className="font-semibold mb-4">仿真参数配置</h3>
                <div className="grid grid-cols-2 gap-4">
                  {analysisConfig.testParams.map((param, index) => (
                    <div key={param.key}>
                      <Label>{param.name} {param.unit && `(${param.unit})`}</Label>
                      <Input 
                        value={simulationData[param.key as keyof typeof simulationData]} 
                        readOnly 
                        className="font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 测试数据 */}
              <div>
                <h3 className="font-semibold mb-4">测试数据</h3>
                <Tabs defaultValue="test1">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="test1">测试机1</TabsTrigger>
                    <TabsTrigger value="test2">测试机2</TabsTrigger>
                  </TabsList>
                  
                  {testData.map((test, index) => (
                    <TabsContent key={index} value={`test${index + 1}`} className="mt-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {analysisConfig.testParams.map((param, index) => (
                            <div key={param.key}>
                              <Label>{param.name} {param.unit && `(${param.unit})`}</Label>
                              <Input 
                                defaultValue={test.data[param.key as keyof typeof test.data]} 
                                className="font-mono"
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileImage className="w-4 h-4 mr-2" />
                            上传图片
                          </Button>
                          <Button variant="outline" size="sm">
                            <Video className="w-4 h-4 mr-2" />
                            上传视频
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* 附件管理 */}
              <div>
                <h3 className="font-semibold mb-4">附件管理</h3>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">点击上传或拖拽文件到此处</p>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    选择文件
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">测试报告.pdf</span>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 数据对比区 */}
        <div className="space-y-6">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>数据对比区</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 数据选择 */}
              <div>
                <h3 className="font-semibold mb-4">数据选择</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="simulation"
                      checked={selectedDatasets.includes("simulation")}
                      onCheckedChange={(checked) => handleDatasetChange("simulation", checked as boolean)}
                    />
                    <Label htmlFor="simulation">仿真数据</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="test1"
                      checked={selectedDatasets.includes("test1")}
                      onCheckedChange={(checked) => handleDatasetChange("test1", checked as boolean)}
                    />
                    <Label htmlFor="test1">测试数据1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="test2"
                      checked={selectedDatasets.includes("test2")}
                      onCheckedChange={(checked) => handleDatasetChange("test2", checked as boolean)}
                    />
                    <Label htmlFor="test2">测试数据2</Label>
                  </div>
                </div>
              </div>

              {/* 对比数据表 */}
              <div>
                <h3 className="font-semibold mb-4">对比数据表</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-data-header">
                        <th className="border border-border p-3 text-left">参数名称</th>
                        <th className="border border-border p-3 text-left">仿真值</th>
                        <th className="border border-border p-3 text-left">测试值</th>
                        <th className="border border-border p-3 text-left">相对误差 (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisConfig.testParams.map((param, index) => {
                        const simValue = simulationData[param.key as keyof typeof simulationData];
                        const testValue = testData[0]?.data[param.key as keyof typeof testData[0]['data']];
                        return (
                          <tr key={param.key} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                            <td className="border border-border p-3 font-medium">
                              {param.name} {param.unit && `(${param.unit})`}
                            </td>
                            <td className="border border-border p-3 font-mono">{simValue}</td>
                            <td className="border border-border p-3 font-mono">{Number(testValue || 0).toFixed(3)}</td>
                            <td className="border border-border p-3 text-warning font-mono">
                              {calculateError(Number(simValue), Number(testValue || 0))}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 图表类型选择 */}
              <div className="flex gap-2">
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  柱状图
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("line")}
                >
                  <LineChart className="w-4 h-4 mr-2" />
                  曲线图
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 可视化图表 */}
      <Card className="hover-scale">
        <CardHeader>
          <CardTitle>可视化图表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="仿真值" fill="hsl(var(--chart-primary))" />
                  <Bar dataKey="测试值1" fill="hsl(var(--chart-secondary))" />
                  <Bar dataKey="测试值2" fill="hsl(var(--chart-tertiary))" />
                </BarChart>
              ) : (
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="仿真值" stroke="hsl(var(--chart-primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="测试值1" stroke="hsl(var(--chart-secondary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="测试值2" stroke="hsl(var(--chart-tertiary))" strokeWidth={2} />
                </RechartsLineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};