import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronRight, 
  Wrench, 
  Settings, 
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  url?: string;
  icon?: any;
  children?: NavItem[];
}

const navigationData: NavItem[] = [
  {
    title: "车床管理",
    icon: Wrench,
    url: "/category/lathe",
    children: [
      {
        title: "CK6140-V2型",
        url: "/category/lathe/ck6140-v2",
        children: [
          { title: "主轴箱分析", url: "/analysis/lathe/ck6140-v2/structure/spindle-box" },
          { title: "床身分析", url: "/analysis/lathe/ck6140-v2/structure/bed" },
          { title: "进给系统分析", url: "/analysis/lathe/ck6140-v2/functional/feed-system" },
          { title: "主传动分析", url: "/analysis/lathe/ck6140-v2/functional/main-drive" }
        ]
      },
      {
        title: "CK6150型",
        url: "/category/lathe/ck6150",
        children: [
          { title: "主轴箱分析", url: "/analysis/lathe/ck6150/structure/spindle-box" },
          { title: "床身分析", url: "/analysis/lathe/ck6150/structure/bed" },
          { title: "进给系统分析", url: "/analysis/lathe/ck6150/functional/feed-system" }
        ]
      },
      {
        title: "CK6132型",
        url: "/category/lathe/ck6132",
        children: [
          { title: "主轴箱分析", url: "/analysis/lathe/ck6132/structure/spindle-box" },
          { title: "床身分析", url: "/analysis/lathe/ck6132/structure/bed" },
          { title: "进给系统分析", url: "/analysis/lathe/ck6132/functional/feed-system" }
        ]
      }
    ]
  },
  {
    title: "铣床管理",
    icon: Settings,
    url: "/category/mill",
    children: [
      {
        title: "XK714型",
        url: "/category/mill/xk714",
        children: [
          { title: "主轴箱分析", url: "/analysis/mill/xk714/structure/spindle-box" },
          { title: "工作台分析", url: "/analysis/mill/xk714/structure/worktable" },
          { title: "主轴驱动分析", url: "/analysis/mill/xk714/functional/spindle-drive" },
          { title: "进给系统分析", url: "/analysis/mill/xk714/functional/feed-system" }
        ]
      },
      {
        title: "XK7136型",
        url: "/category/mill/xk7136",
        children: [
          { title: "主轴箱分析", url: "/analysis/mill/xk7136/structure/spindle-box" },
          { title: "工作台分析", url: "/analysis/mill/xk7136/structure/worktable" },
          { title: "主轴驱动分析", url: "/analysis/mill/xk7136/functional/spindle-drive" },
          { title: "进给系统分析", url: "/analysis/mill/xk7136/functional/feed-system" }
        ]
      },
      {
        title: "XK7125型",
        url: "/category/mill/xk7125",
        children: [
          { title: "主轴箱分析", url: "/analysis/mill/xk7125/structure/spindle-box" },
          { title: "工作台分析", url: "/analysis/mill/xk7125/structure/worktable" },
          { title: "主轴驱动分析", url: "/analysis/mill/xk7125/functional/spindle-drive" },
          { title: "进给系统分析", url: "/analysis/mill/xk7125/functional/feed-system" }
        ]
      }
    ]
  }
];

const NavMenuItem = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.url === location.pathname;
  const isParentActive = item.children?.some(child => 
    child.url === location.pathname || 
    child.children?.some(grandchild => grandchild.url === location.pathname)
  );

  const getFontSize = () => {
    switch(level) {
      case 0: return "text-base font-semibold"; // 一级：大号粗体
      case 1: return "text-sm font-medium";    // 二级：中号中等粗细
      case 2: return "text-xs font-normal";    // 三级：小号正常
      default: return "text-xs";
    }
  };

  const getIndentation = () => {
    return level * 20 + 16; // 更明显的缩进
  };

  if (hasChildren) {
    return (
      <div>
        <div className="flex">
          {/* 标题区域 - 可点击跳转 */}
          <NavLink to={item.url || "#"} className="flex-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto py-2 font-normal transition-all duration-200 hover:bg-muted/50",
                (isActive || isParentActive) && "bg-sidebar-active-bg text-sidebar-active",
                getFontSize()
              )}
              style={{ paddingLeft: getIndentation() }}
            >
              {item.icon && <item.icon className={cn("mr-3 shrink-0", level === 0 ? "w-5 h-5" : "w-4 h-4")} />}
              <span className="truncate flex-1 text-left">{item.title}</span>
            </Button>
          </NavLink>
          
          {/* 展开/折叠按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="px-2 hover:bg-muted/50 transition-colors"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4 transition-transform" />
            ) : (
              <ChevronRight className="w-4 h-4 transition-transform" />
            )}
          </Button>
        </div>
        
        {isOpen && (
          <div className="space-y-1 mt-1">
            {item.children.map((child, index) => (
              <NavMenuItem key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink to={item.url || "#"} className="block">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start h-auto py-2 font-normal transition-all duration-200 hover:bg-muted/50",
          isActive && "bg-sidebar-active-bg text-sidebar-active shadow-sm",
          getFontSize()
        )}
        style={{ paddingLeft: getIndentation() }}
      >
        {item.icon && <item.icon className={cn("mr-3 shrink-0", level === 0 ? "w-5 h-5" : "w-4 h-4")} />}
        <span className="truncate flex-1 text-left">{item.title}</span>
        {level === 2 && <Target className="w-3 h-3 ml-2 opacity-60" />}
      </Button>
    </NavLink>
  );
};

export const Sidebar = () => {
  return (
    <div className="w-72 bg-sidebar border-r border-sidebar-border overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">MT</span>
          </div>
          设备管理
        </h2>
        <nav className="space-y-2">
          {navigationData.map((item, index) => (
            <NavMenuItem key={index} item={item} />
          ))}
        </nav>
      </div>
    </div>
  );
};