import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState } from "react";
import { toast } from "sonner";
import { Settings, User, Mail, Lock, Bell, Monitor, Palette, Save } from "lucide-react";

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    soundEffects: true,
    emailUpdates: true,
    dataRetention: 30
  });

  const [profile, setProfile] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    company: '通用技术集团机床工程研究院',
    position: '工程师'
  });

  const handleSaveSettings = () => {
    // 注意：这里保存的是系统设置，不是用户信息
    // 可以后续添加系统设置的API
    console.log('💾 保存系统设置:', settings);
    toast.success('设置已保存');
  };

  const handleSaveProfile = async () => {
    try {
      console.log('💾 系统设置页面保存用户信息:', profile);
      
      // 检查 updateProfile 函数是否可用
      if (!updateProfile) {
        console.error('❌ updateProfile 函数不可用');
        toast.error('用户认证服务不可用，请刷新页面重试');
        return;
      }
      
      // 验证必填字段
      if (!profile.name || profile.name.trim() === '') {
        toast.error('用户名不能为空');
        return;
      }
      
      console.log('🚀 系统设置页面开始调用 updateProfile...');
      await updateProfile({ 
        fullName: profile.name.trim()
      });
      
      console.log('✅ 系统设置页面 updateProfile 调用成功');
      toast.success('个人信息已更新');
    } catch (error) {
      console.error('❌ 系统设置页面保存失败详细错误:', error);
      
      // 提供更详细的错误信息
      if (error instanceof Error) {
        toast.error(`保存失败: ${error.message}`);
      } else {
        toast.error('保存失败，请重试');
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">系统设置</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          管理您的账户信息和系统偏好设置
        </p>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            系统设置
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            通知设置
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            外观设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>系统偏好</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>自动保存</Label>
                  <p className="text-sm text-muted-foreground">自动保存您的工作进度</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>声音效果</Label>
                  <p className="text-sm text-muted-foreground">操作时播放提示音</p>
                </div>
                <Switch
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEffects: checked }))}
                />
              </div>
              <Separator />
              <div>
                <Label htmlFor="retention">数据保留期限（天）</Label>
                <Input
                  id="retention"
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                通知偏好
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>系统通知</Label>
                  <p className="text-sm text-muted-foreground">接收系统状态和更新通知</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>邮件通知</Label>
                  <p className="text-sm text-muted-foreground">接收重要更新的邮件通知</p>
                </div>
                <Switch
                  checked={settings.emailUpdates}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailUpdates: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                外观设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>主题颜色</Label>
                <div className="flex gap-3 mt-3">
                  <div 
                    className="w-10 h-10 bg-blue-500 rounded-full border-2 border-background shadow-lg hover-scale cursor-pointer transition-transform hover:scale-110" 
                    onClick={() => {
                      document.documentElement.style.setProperty('--primary', '217 91% 60%');
                      toast.success('主题色已更改为蓝色');
                    }}
                  ></div>
                  <div 
                    className="w-10 h-10 bg-green-500 rounded-full border-2 border-background shadow-lg hover-scale cursor-pointer transition-transform hover:scale-110"
                    onClick={() => {
                      document.documentElement.style.setProperty('--primary', '142 76% 36%');
                      toast.success('主题色已更改为绿色');
                    }}
                  ></div>
                  <div 
                    className="w-10 h-10 bg-purple-500 rounded-full border-2 border-background shadow-lg hover-scale cursor-pointer transition-transform hover:scale-110"
                    onClick={() => {
                      document.documentElement.style.setProperty('--primary', '262 83% 58%');
                      toast.success('主题色已更改为紫色');
                    }}
                  ></div>
                  <div 
                    className="w-10 h-10 bg-orange-500 rounded-full border-2 border-background shadow-lg hover-scale cursor-pointer transition-transform hover:scale-110"
                    onClick={() => {
                      document.documentElement.style.setProperty('--primary', '25 95% 53%');
                      toast.success('主题色已更改为橙色');
                    }}
                  ></div>
                  <div 
                    className="w-10 h-10 bg-red-500 rounded-full border-2 border-background shadow-lg hover-scale cursor-pointer transition-transform hover:scale-110"
                    onClick={() => {
                      document.documentElement.style.setProperty('--primary', '0 84% 60%');
                      toast.success('主题色已更改为红色');
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">点击颜色圆圈即可切换主题色</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button onClick={handleSaveSettings} size="lg" className="hover-scale">
          <Save className="w-4 h-4 mr-2" />
          保存所有设置
        </Button>
      </div>
    </div>
  );
};