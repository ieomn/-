import { Settings, HelpCircle, User, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { NavLink } from "react-router-dom";

export const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('已退出登录');
    } catch (error) {
      toast.error('退出登录失败');
    }
  };

  return (
    <header className="h-16 bg-header-bg text-header-text flex items-center justify-between px-6 border-b border-border z-10">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">MT</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold">精密制造科技有限公司</h1>
          <p className="text-sm text-header-text/70">机床性能数据管理与分析平台</p>
        </div>
        <Button variant="ghost" size="sm" className="text-header-text hover:bg-white/10 ml-4" asChild>
          <NavLink to="/">
            <Home className="w-4 h-4 mr-2" />
            主界面
          </NavLink>
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-header-text hover:bg-white/10" asChild>
          <NavLink to="/help">
            <HelpCircle className="w-4 h-4 mr-2" />
            帮助
          </NavLink>
        </Button>
        
        <Button variant="ghost" size="sm" className="text-header-text hover:bg-white/10" asChild>
          <NavLink to="/settings">
            <Settings className="w-4 h-4 mr-2" />
            设置
          </NavLink>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-header-text hover:bg-white/10">
              <User className="w-4 h-4 mr-2" />
              {user?.user_metadata?.name || user?.email || '用户'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.user_metadata?.name || '用户'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/profile" className="w-full">个人资料</NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/account" className="w-full">账户设置</NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};