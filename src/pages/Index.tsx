import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Database, Settings, TrendingUp, ExternalLink, Plus, FileText, Wrench, Cog, Users, BookOpen, RefreshCw } from "lucide-react";
import { NavLink } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface OverviewStats {
  totalTestRecords: number;
  completedAnalyses: number;
  averageErrorRate: number;
  activeMachines: number;
}

const Index = () => {
  const [stats, setStats] = useState<OverviewStats>({
    totalTestRecords: 0,
    completedAnalyses: 0,
    averageErrorRate: 0,
    activeMachines: 0
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const dashboardData = await apiClient.getDashboardStats();
      
      setStats({
        totalTestRecords: dashboardData.totalTestRecords,
        completedAnalyses: dashboardData.completedAnalyses,
        averageErrorRate: dashboardData.averageErrorRate,
        activeMachines: dashboardData.activeMachines
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('加载仪表板数据失败 - 请确保API服务器正在运行');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">机床性能数据管理与分析平台</h1>
          <p className="text-lg text-muted-foreground">
            专业的机床仿真数据与测试数据对比分析系统
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadDashboardData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已录入数据</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalTestRecords.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">条测试记录</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">对比分析</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.completedAnalyses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">次分析完成</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均误差</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${stats.averageErrorRate}%`}
            </div>
            <p className="text-xs text-muted-foreground">仿真与实测</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃机床</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.activeMachines.toString()}
            </div>
            <p className="text-xs text-muted-foreground">台设备在线</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>快速导航</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 主要管理功能 */}
            <div className="grid grid-cols-1 gap-3">
              <NavLink to="/category/lathe" className="block">
                <div className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 cursor-pointer group">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wrench className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">车床管理中心</h4>
                    <p className="text-sm text-muted-foreground">管理和监控车床设备运行状态</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </div>
              </NavLink>
              
              <NavLink to="/category/mill" className="block">
                <div className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 cursor-pointer group">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Cog className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors">铣床管理中心</h4>
                    <p className="text-sm text-muted-foreground">管理和监控铣床设备运行状态</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                </div>
              </NavLink>
            </div>
            
            {/* 快捷操作 */}
            <div className="pt-2 border-t border-border">
              <div className="grid grid-cols-2 gap-3">
                <NavLink to="/data-upload" className="block">
                  <div className="flex flex-col items-center gap-3 p-4 border border-border rounded-xl hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 cursor-pointer group">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-violet-600/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground group-hover:text-violet-600 transition-colors">添加数据</p>
                      <p className="text-xs text-muted-foreground">上传新数据</p>
                    </div>
                  </div>
                </NavLink>
                
                <NavLink to="/help" className="block">
                  <div className="flex flex-col items-center gap-3 p-4 border border-border rounded-xl hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 cursor-pointer group">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground group-hover:text-amber-600 transition-colors">操作指南</p>
                      <p className="text-xs text-muted-foreground">使用帮助</p>
                    </div>
                  </div>
                </NavLink>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统公告</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-medium">系统更新</h4>
              <p className="text-sm text-muted-foreground">新增图表对比功能，支持多种可视化方式</p>
              <p className="text-xs text-muted-foreground mt-1">2024-12-05</p>
            </div>
            <div className="border-l-4 border-muted pl-4">
              <h4 className="font-medium">数据备份</h4>
              <p className="text-sm text-muted-foreground">系统将于本周末进行例行数据备份</p>
              <p className="text-xs text-muted-foreground mt-1">2024-12-03</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
