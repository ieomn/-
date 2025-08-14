import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/AuthProvider";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Settings, 
  Activity,
  BarChart3,
  Database,
  Clock,
  Save,
  Edit
} from "lucide-react";

export const UserProfilePage = () => {
  const { user, profile: authProfile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    name: '',
    email: '',
    company: '精密制造科技有限公司',
    department: '',
    position: '高级工程师'
  });

  // 同步 AuthProvider 的用户信息到本地状态
  useEffect(() => {
    if (authProfile) {
      setLocalProfile({
        name: authProfile.fullName || '',
        email: authProfile.email || '',
        company: '精密制造科技有限公司',
        department: authProfile.department || '',
        position: '高级工程师'
      });
    }
  }, [authProfile]);

  const handleSaveProfile = async () => {
    try {
      console.log('💾 个人中心保存信息:', localProfile);
      
      // 检查 updateProfile 函数是否可用
      if (!updateProfile) {
        console.error('❌ updateProfile 函数不可用');
        toast.error('用户认证服务不可用，请刷新页面重试');
        return;
      }
      
      // 验证必填字段
      if (!localProfile.name || localProfile.name.trim() === '') {
        toast.error('用户名不能为空');
        return;
      }
      
      if (!localProfile.department || localProfile.department.trim() === '') {
        toast.error('部门不能为空');
        return;
      }
      
      console.log('🚀 个人中心开始调用 updateProfile...');
      await updateProfile({ 
        fullName: localProfile.name.trim(),
        department: localProfile.department.trim()
      });
      
      console.log('✅ 个人中心 updateProfile 调用成功');
      toast.success('个人信息已更新');
      setIsEditing(false);
    } catch (error) {
      console.error('❌ 个人中心保存失败详细错误:', error);
      
      // 提供更详细的错误信息
      if (error instanceof Error) {
        toast.error(`保存失败: ${error.message}`);
      } else {
        toast.error('保存失败，请重试');
      }
    }
  };

  const userStats = {
    totalAnalysis: 156,
    dataUploaded: 2.3,
    lastActive: "2024-12-05 16:30",
    memberSince: "2024-01-15",
    favoriteModels: ["CK6140-V2", "XK714"],
    recentActivity: [
      { action: "数据分析", model: "CK6140-V2型", time: "2小时前" },
      { action: "上传数据", model: "XK714型", time: "4小时前" },
      { action: "导出报告", model: "CK6150型", time: "1天前" },
      { action: "数据对比", model: "CK6140-V2型", time: "2天前" }
    ]
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">个人中心</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          查看和管理您的个人信息、使用统计和活动记录
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 个人信息卡片 */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src="" alt={authProfile?.fullName || 'User'} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {(authProfile?.fullName || authProfile?.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold mb-1">
                  {authProfile?.fullName || '用户'}
                </h2>
                <p className="text-muted-foreground mb-4">{authProfile?.email}</p>
                <Badge className="mb-4">高级用户</Badge>
                <Button variant="outline" className="w-full hover-scale" asChild>
                  <NavLink to="/account">
                    <Settings className="w-4 h-4 mr-2" />
                    编辑资料
                  </NavLink>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">基本信息</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                  className="hover-scale"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      value={localProfile.name}
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={localProfile.email}
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">公司</Label>
                    <Input
                      id="company"
                      value={localProfile.company}
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">部门</Label>
                    <Input
                      id="department"
                      value={localProfile.department}
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">职位</Label>
                    <Input
                      id="position"
                      value={localProfile.position}
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, position: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} size="sm" className="hover-scale">
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(false)}
                      className="hover-scale"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">邮箱</p>
                      <p className="font-medium">{authProfile?.email || '未设置'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">公司</p>
                      <p className="font-medium">精密制造科技有限公司</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">部门</p>
                      <p className="font-medium">{authProfile?.department || '未设置'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">职位</p>
                      <p className="font-medium">高级工程师</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">加入时间</p>
                      <p className="font-medium">{userStats.memberSince}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 使用统计 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                使用统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{userStats.totalAnalysis}</div>
                  <p className="text-sm text-muted-foreground">分析次数</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{userStats.dataUploaded}GB</div>
                  <p className="text-sm text-muted-foreground">数据上传</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">98%</div>
                  <p className="text-sm text-muted-foreground">分析准确率</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 活动记录 */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                最近活动
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userStats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 收藏模型 */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                收藏模型
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {userStats.favoriteModels.map((model, index) => (
                  <Badge key={index} variant="secondary" className="hover-scale cursor-pointer">
                    {model}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 快速操作 */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 hover-scale" asChild>
                  <NavLink to="/upload">
                    <Database className="w-6 h-6" />
                    <span className="text-sm">数据上传</span>
                  </NavLink>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 hover-scale" asChild>
                  <NavLink to="/analysis">
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">数据分析</span>
                  </NavLink>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 hover-scale" asChild>
                  <NavLink to="/account">
                    <Settings className="w-6 h-6" />
                    <span className="text-sm">账户设置</span>
                  </NavLink>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 hover-scale" asChild>
                  <NavLink to="/settings">
                    <User className="w-6 h-6" />
                    <span className="text-sm">系统配置</span>
                  </NavLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};