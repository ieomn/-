import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Phone, 
  Mail, 
  Search,
  FileText,
  Video,
  Users,
  Lightbulb
} from "lucide-react";

const helpCategories = [
  {
    title: "快速入门",
    icon: Lightbulb,
    items: [
      {
        question: "如何开始使用系统？",
        answer: "首先登录系统，然后在左侧导航栏选择要管理的机床类型（车床或铣床），接着选择具体的机床型号，最后进入数据分析页面进行操作。"
      },
      {
        question: "如何录入测试数据？",
        answer: "在数据分析页面的'测试数据'标签页中，选择对应的测试机，然后在输入框中填写位移、应力、频率等参数值，还可以上传相关图片和视频。"
      },
      {
        question: "如何进行数据对比分析？",
        answer: "在数据对比区域，勾选要对比的数据集（仿真数据、测试数据1、测试数据2），系统会自动生成对比表格并计算相对误差，同时提供柱状图和曲线图进行可视化展示。"
      }
    ]
  },
  {
    title: "数据管理",
    icon: FileText,
    items: [
      {
        question: "支持哪些数据格式？",
        answer: "系统支持Excel(.xlsx, .xls)、CSV(.csv)、JSON(.json)格式的数据导入，图片支持JPG、PNG格式，视频支持MP4、AVI格式。"
      },
      {
        question: "如何备份我的数据？",
        answer: "在设置页面的'系统设置'标签中，可以设置自动备份频率。您也可以在数据分析页面点击'导出'按钮手动导出数据。"
      },
      {
        question: "数据存储容量限制？",
        answer: "每个用户账户默认提供10GB存储空间，单个文件最大支持100MB。如需更多空间，请联系管理员升级账户。"
      }
    ]
  },
  {
    title: "系统功能",
    icon: Book,
    items: [
      {
        question: "如何切换图表类型？",
        answer: "在可视化图表区域下方，点击'柱状图'或'曲线图'按钮即可切换不同的图表展示方式。"
      },
      {
        question: "如何设置用户权限？",
        answer: "系统管理员可以在用户管理页面设置不同用户的访问权限，包括只读、编辑、管理等不同级别。"
      },
      {
        question: "支持多语言吗？",
        answer: "目前系统主要支持中文界面，英文界面正在开发中，预计下个版本推出。"
      }
    ]
  },
  {
    title: "故障排除",
    icon: Users,
    items: [
      {
        question: "登录时提示密码错误怎么办？",
        answer: "请确认输入的邮箱和密码正确，如果忘记密码，可以点击'忘记密码'链接重置。如果问题持续，请联系系统管理员。"
      },
      {
        question: "数据上传失败怎么办？",
        answer: "请检查文件大小是否超过100MB限制，文件格式是否支持。如果网络连接不稳定，请尝试重新上传。"
      },
      {
        question: "图表显示异常怎么办？",
        answer: "请尝试刷新页面，清理浏览器缓存，或更换浏览器。建议使用Chrome、Firefox或Edge浏览器的最新版本。"
      }
    ]
  }
];

export const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">帮助中心</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          查找使用指南、常见问题解答和技术支持信息
        </p>
      </div>

      {/* 搜索框 */}
      <Card className="mb-8 hover-scale">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索帮助内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 帮助内容 */}
        <div className="lg:col-span-2 space-y-6">
          {filteredCategories.map((category, index) => (
            <Card key={index} className="animate-fade-in hover-scale" style={{animationDelay: `${index * 100}ms`}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <category.icon className="w-6 h-6 text-primary" />
                  {category.title}
                  <Badge variant="secondary">{category.items.length} 项</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`item-${itemIndex}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}

          {filteredCategories.length === 0 && searchTerm && (
            <Card className="hover-scale">
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">未找到相关内容</h3>
                <p className="text-muted-foreground">
                  尝试使用不同的关键词搜索，或联系技术支持获取帮助
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 快速链接 */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                快速链接
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start hover-scale">
                <Video className="w-4 h-4 mr-2" />
                视频教程
              </Button>
              <Button variant="outline" className="w-full justify-start hover-scale">
                <FileText className="w-4 h-4 mr-2" />
                用户手册
              </Button>
              <Button variant="outline" className="w-full justify-start hover-scale">
                <Book className="w-4 h-4 mr-2" />
                API 文档
              </Button>
            </CardContent>
          </Card>

          {/* 联系支持 */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                联系我们
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">技术热线</p>
                  <p className="text-sm text-muted-foreground">400-123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">邮件支持</p>
                  <p className="text-sm text-muted-foreground">support@example.com</p>
                </div>
              </div>
              <Button className="w-full hover-scale">
                <MessageCircle className="w-4 h-4 mr-2" />
                在线客服
              </Button>
            </CardContent>
          </Card>

          {/* 系统状态 */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>系统状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">系统运行状态</span>
                <Badge className="bg-success text-success-foreground">正常</Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">数据库连接</span>
                <Badge className="bg-success text-success-foreground">正常</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">服务器负载</span>
                <Badge variant="secondary">轻度</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};