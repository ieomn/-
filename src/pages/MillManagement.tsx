import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { Settings, Plus, BarChart, Database } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const millMachines = [
  {
    id: "xk714",
    name: "XK714型数控铣床",
    status: "运行中",
    lastUpdate: "2024-12-05 15:20",
    dataCount: 789,
    image: "🏭"
  },
  {
    id: "xk7136",
    name: "XK7136型数控铣床",
    status: "运行中",
    lastUpdate: "2024-12-05 13:45",
    dataCount: 1024,
    image: "🏭"
  },
  {
    id: "xk7125",
    name: "XK7125型数控铣床",
    status: "离线",
    lastUpdate: "2024-12-03 18:30",
    dataCount: 456,
    image: "🏭"
  }
];

export const MillManagement = () => {
  const [isAddingDevice, setIsAddingDevice] = useState(false);

  const handleAddDevice = () => {
    console.log('🔧 添加新铣床设备');
    setIsAddingDevice(true);
    
    // 模拟添加设备的过程
    setTimeout(() => {
      setIsAddingDevice(false);
      toast.success('新铣床设备添加成功！');
    }, 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">铣床管理中心</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          管理和监控所有铣床设备的运行状态、数据采集和性能分析
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总设备数</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{millMachines.length}</div>
            <p className="text-xs text-muted-foreground">台铣床设备</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运行设备</CardTitle>
            <Database className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {millMachines.filter(m => m.status === "运行中").length}
            </div>
            <p className="text-xs text-muted-foreground">台正常运行</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">离线设备</CardTitle>
            <div className="h-4 w-4 rounded-full bg-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {millMachines.filter(m => m.status === "离线").length}
            </div>
            <p className="text-xs text-muted-foreground">台离线</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总数据量</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {millMachines.reduce((sum, m) => sum + m.dataCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">条数据记录</p>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">设备列表</h2>
        <Button 
          onClick={handleAddDevice} 
          disabled={isAddingDevice}
          className="hover-scale"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isAddingDevice ? '添加中...' : '添加新设备'}
        </Button>
      </div>

      {/* 设备列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {millMachines.map((machine, index) => (
          <Card key={machine.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in hover-scale" style={{animationDelay: `${index * 100}ms`}}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-4xl">{machine.image}</div>
                <Badge variant={
                  machine.status === "运行中" ? "default" : 
                  machine.status === "离线" ? "destructive" : "secondary"
                }>
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
                  <NavLink to={`/category/mill/${machine.id}`}>
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