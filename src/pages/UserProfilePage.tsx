import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/AuthProvider";
import { NavLink } from "react-router-dom";
import { useState } from "react";
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
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    company: '精密制造科技有限公司',
    department: '机床工程部',
    position: '高级工程师'
  });

  const handleSaveProfile = () => {
    // 这里可以连接到后端更新用户信息
    toast.success('个人信息已更新');
    setIsEditing(false);
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
                  <AvatarImage src="" alt={user?.user_metadata?.name || 'User'} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {(user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold mb-1">
                  {user?.user_metadata?.name || '用户'}
                </h2>
                <p className="text-muted-foreground mb-4">{user?.email}</p>
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
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">公司</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">部门</Label>
                    <Input
                      id="department"
                      value={profile.department}
                      onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">职位</Label>
                    <Input
                      id="position"
                      value={profile.position}
                      onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
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
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">公司</p>
                      <p className="font-medium">{profile.company}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">部门</p>
                      <p className="font-medium">{profile.department}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">职位</p>
                      <p className="font-medium">{profile.position}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">注册时间</p>
                      <p className="font-medium">{userStats.memberSince}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 使用统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{userStats.totalAnalysis}</p>
                    <p className="text-xs text-muted-foreground">分析次数</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Database className="w-8 h-8 text-success" />
                  <div>
                    <p className="text-2xl font-bold">{userStats.dataUploaded}GB</p>
                    <p className="text-xs text-muted-foreground">数据上传</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-warning" />
                  <div>
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-xs text-muted-foreground">在线时长</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-bold">2小时前</p>
                    <p className="text-xs text-muted-foreground">最后活动</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 最近活动 */}
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
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.model}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{activity.time}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 常用型号 */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>常用机床型号</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {userStats.favoriteModels.map((model, index) => (
                  <Badge key={index} variant="secondary" className="hover-scale cursor-pointer">
                    {model}
                  </Badge>
                ))}
                <Button variant="outline" size="sm" className="hover-scale">
                  + 添加
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 权限信息 */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>账户权限</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">数据查看</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">数据编辑</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">数据导出</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-sm">用户管理</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span className="text-sm">系统配置</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};