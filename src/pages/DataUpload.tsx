import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Plus,
  Download,
  Database
} from "lucide-react";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
}

export const DataUpload = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [files, setFiles] = useState<UploadFile[]>([]);

  const categories = [
    { value: "lathe", label: "车床数据" },
    { value: "mill", label: "铣床数据" }
  ];

  const models = {
    lathe: [
      { value: "ck6140-v2", label: "CK6140-V2型" },
      { value: "ck6150", label: "CK6150型" },
      { value: "ck6132", label: "CK6132型" }
    ],
    mill: [
      { value: "xk714", label: "XK714型" },
      { value: "xk7136", label: "XK7136型" },
      { value: "xk7125", label: "XK7125型" }
    ]
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles: UploadFile[] = selectedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const simulateUpload = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading' as const } : f
    ));

    const interval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === fileId && f.status === 'uploading') {
          const newProgress = Math.min(f.progress + Math.random() * 20, 100);
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...f, progress: 100, status: 'success' as const };
          }
          return { ...f, progress: newProgress };
        }
        return f;
      }));
    }, 300);
  };

  const handleUpload = () => {
    if (!selectedCategory || !selectedModel) {
      toast.error('请选择设备类型和型号');
      return;
    }
    
    if (files.length === 0) {
      toast.error('请选择要上传的文件');
      return;
    }

    files.forEach(file => {
      if (file.status === 'pending') {
        simulateUpload(file.id);
      }
    });

    toast.success('开始上传数据文件');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">数据上传</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          上传机床测试数据、仿真数据和相关文档
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 上传配置 */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>上传配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">设备类型</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择设备类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="model">设备型号</Label>
                <Select 
                  value={selectedModel} 
                  onValueChange={setSelectedModel}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择设备型号" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory && models[selectedCategory as keyof typeof models]?.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">数据描述</Label>
                <Textarea
                  id="description"
                  placeholder="请描述数据内容、测试条件等信息..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>支持格式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">Excel (.xlsx, .xls)</Badge>
                <Badge variant="outline">CSV (.csv)</Badge>
                <Badge variant="outline">Text (.txt)</Badge>
                <Badge variant="outline">JSON (.json)</Badge>
                <Badge variant="outline">PDF (.pdf)</Badge>
                <Badge variant="outline">图片 (.jpg, .png)</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                单个文件最大100MB，总大小不超过1GB
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 文件上传区 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>文件上传</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">拖拽文件到此处或点击选择</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  支持多文件选择，可同时上传多个数据文件
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv,.txt,.json,.pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    选择文件
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 文件列表 */}
          {files.length > 0 && (
            <Card className="hover-scale">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>待上传文件 ({files.length})</CardTitle>
                  <Button onClick={handleUpload} disabled={!selectedCategory || !selectedModel}>
                    <Upload className="w-4 h-4 mr-2" />
                    开始上传
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <FileText className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                        {file.status === 'uploading' && (
                          <Progress value={file.progress} className="mt-2" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-success" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        )}
                        {file.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 快速操作 */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                下载模板
              </Button>
              <Button variant="outline" className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                查看示例
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};