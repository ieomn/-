import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { Wrench, Plus, Settings, BarChart, Database } from "lucide-react";

const latheMachines = [
  {
    id: "ck6140-v2",
    name: "CK6140-V2型数控车床",
    status: "运行中",
    lastUpdate: "2024-12-05 14:30",
    dataCount: 1245,
    image: "🏭"
  },
  {
    id: "ck6150",
    name: "CK6150型数控车床", 
    status: "维护中",
    lastUpdate: "2024-12-04 09:15",
    dataCount: 892,
    image: "🏭"
  },
  {
    id: "ck6132",
    name: "CK6132型数控车床",
    status: "运行中", 
    lastUpdate: "2024-12-05 16:45",
    dataCount: 567,
    image: "🏭"
  }
];

export const LatheManagement = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Wrench className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">车床管理中心</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          管理和监控所有车床设备的运行状态、数据采集和性能分析
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总设备数</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latheMachines.length}</div>
            <p className="text-xs text-muted-foreground">台车床设备</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运行设备</CardTitle>
            <Database className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {latheMachines.filter(m => m.status === "运行中").length}
            </div>
            <p className="text-xs text-muted-foreground">台正常运行</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">维护设备</CardTitle>
            <Settings className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {latheMachines.filter(m => m.status === "维护中").length}
            </div>
            <p className="text-xs text-muted-foreground">台维护中</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总数据量</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latheMachines.reduce((sum, m) => sum + m.dataCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">条数据记录</p>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">设备列表</h2>
        <Button className="hover-scale">
          <Plus className="w-4 h-4 mr-2" />
          添加新设备
        </Button>
      </div>

      {/* 设备列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {latheMachines.map((machine, index) => (
          <Card key={machine.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in hover-scale" style={{animationDelay: `${index * 100}ms`}}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-4xl">{machine.image}</div>
                <Badge variant={machine.status === "运行中" ? "default" : "secondary"}>
                  {machine.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{machine.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <p>最后更新: {machine.lastUpdate}</p>
                <p>数据量: {machine.dataCount} 条</p>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <NavLink to={`/category/lathe/${machine.id}`}>
                    查看详情
                  </NavLink>
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};