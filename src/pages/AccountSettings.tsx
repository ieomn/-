import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { User, Mail, Shield, Key, Bell, Trash2 } from "lucide-react";

export const AccountSettings = () => {
  const { user } = useAuth();

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">账户设置</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          管理您的个人信息和账户安全设置
        </p>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input 
                  id="username" 
                  defaultValue={user?.user_metadata?.name || "用户"} 
                  placeholder="请输入用户名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱地址</Label>
                <Input 
                  id="email" 
                  type="email"
                  defaultValue={user?.email || ""} 
                  placeholder="请输入邮箱地址"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">部门</Label>
              <Input 
                id="department" 
                defaultValue="设备管理部" 
                placeholder="请输入部门"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">管理员</Badge>
                <span className="text-sm text-muted-foreground">具有完整系统访问权限</span>
              </div>
            </div>
            <Button>保存基本信息</Button>
          </CardContent>
        </Card>

        {/* 安全设置 */}
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              安全设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">当前密码</Label>
              <Input 
                id="current-password" 
                type="password"
                placeholder="请输入当前密码"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  placeholder="请输入新密码"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  placeholder="请确认新密码"
                />
              </div>
            </div>
            <Button variant="outline">
              <Key className="w-4 h-4 mr-2" />
              更新密码
            </Button>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              通知设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">系统通知</p>
                <p className="text-sm text-muted-foreground">接收系统更新和维护通知</p>
              </div>
              <Badge variant="default">已启用</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">数据报告</p>
                <p className="text-sm text-muted-foreground">接收定期数据分析报告</p>
              </div>
              <Badge variant="default">已启用</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">设备警报</p>
                <p className="text-sm text-muted-foreground">接收设备异常警报</p>
              </div>
              <Badge variant="default">已启用</Badge>
            </div>
            <Button variant="outline">更新通知设置</Button>
          </CardContent>
        </Card>

        <Separator />

        {/* 危险操作 */}
        <Card className="border-destructive/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              危险操作
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-destructive/5 p-4 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">删除账户</h4>
              <p className="text-sm text-muted-foreground mb-4">
                一旦删除账户，您的所有数据将被永久清除，此操作不可撤销。
              </p>
              <Button variant="destructive" size="sm">
                删除我的账户
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};