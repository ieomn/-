import { useState } from "react";
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import FileUploadDialog, { UploadedFile } from "@/components/ui/file-upload-dialog";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Plus,
  Download,
  Database,
  Image,
  Video,
  PlayCircle,
  Eye
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

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

  const simulateProgress = (fileId: string, done?: () => void) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'uploading' as const } : f));
    const interval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === fileId && f.status === 'uploading') {
          const newProgress = Math.min(f.progress + Math.random() * 20, 98);
          return { ...f, progress: newProgress };
        }
        return f;
      }));
    }, 250);
    return () => {
      clearInterval(interval);
      if (done) done();
    };
  };

  const handleUpload = async () => {
    console.log('🚀 开始上传 - 调试信息:', { selectedCategory, selectedModel, filesCount: files.length });

    if (!selectedCategory || !selectedModel) {
      toast.error('请选择设备类型和型号');
      return;
    }
    
    if (files.length === 0) {
      toast.error('请选择要上传的文件');
      return;
    }

    try {
      // 获取实际的文件对象
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (!input || !input.files) {
        toast.error('无法获取文件，请重新选择');
        return;
      }

      const selectedFiles = Array.from(input.files);
      console.log('📁 开始处理文件:', selectedFiles.length);

      // 确保文件数量匹配
      if (selectedFiles.length !== files.length) {
        console.warn('文件数量不匹配，重新同步文件列表');
        // 重新同步文件列表
        const newFiles: UploadFile[] = selectedFiles.map((file, index) => ({
          id: `file-${Date.now()}-${index}`,
          name: file.name,
          size: file.size,
          status: 'pending',
          progress: 0
        }));
        setFiles(newFiles);
      }

      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const fileState = files[index];
        
        if (!fileState || fileState.status !== 'pending') continue;
        
        console.log(`📤 上传文件 ${index + 1}/${selectedFiles.length}:`, file.name);

        const stopProgress = simulateProgress(fileState.id);

        try {
          // 转换为Base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = (reader.result as string) || '';
              const b64 = result.split(',')[1] || '';
              resolve(b64);
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });

          console.log(`🔤 Base64 转换完成，长度: ${base64.length}`);

          // 调用增强的上传API
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/files/upload-enhanced`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: file.name,
              mimeType: file.type,
              dataBase64: base64,
              fileSize: file.size,
              sessionId: `${selectedCategory}-${selectedModel}`,
              description: description
            })
          });

          if (!response.ok) {
            throw new Error(`上传失败: ${response.statusText}`);
          }

          const result = await response.json();
          console.log('✅ 文件上传和解析完成:', result);

          stopProgress();
          setFiles(prev => prev.map(x => x.id === fileState.id ? { ...x, progress: 100, status: 'success' } : x));
          
          // 添加到已上传文件列表
          const uploadedFile: UploadedFile = {
            id: result.id,
            name: result.fileName,
            size: result.fileSize,
            type: result.mimeType,
            url: result.url,
            thumbnailUrl: result.thumbnailUrl,
            uploadProgress: 100,
            status: 'completed',
            parsedData: result.parsedData,
            processingResults: result.processingResults
          };
          
          setUploadedFiles(prev => [...prev, uploadedFile]);
          
        } catch (fileError) {
          console.error(`❌ 文件 ${file.name} 上传失败:`, fileError);
          stopProgress();
          setFiles(prev => prev.map(x => x.id === fileState.id ? { ...x, status: 'error' } : x));
          toast.error(`文件 ${file.name} 上传失败: ${fileError instanceof Error ? fileError.message : '未知错误'}`);
        }
      }

      toast.success('所有文件上传并解析完成');
    } catch (err) {
      console.error('💥 上传过程中出现错误:', err);
      setFiles(prev => prev.map(x => x.status === 'uploading' ? { ...x, status: 'error' } : x));
      toast.error(`上传失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const handleFilesUploaded = (newFiles: UploadedFile[]) => {
    console.log('📁 收到上传完成的文件:', newFiles);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`成功上传 ${newFiles.length} 个文件`);
  };

  const renderFilePreview = (file: UploadedFile) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    if (file.type.startsWith('image/')) {
      return (
        <div className="mt-2">
          <img 
            src={file.thumbnailUrl ? `${baseUrl}${file.thumbnailUrl}` : `${baseUrl}${file.url}`}
            alt={file.name}
            className="max-w-full h-32 object-cover rounded border"
          />
        </div>
      );
    }
    
    if (file.type.startsWith('video/')) {
      return (
        <div className="mt-2">
          <video 
            src={`${baseUrl}${file.url}`}
            className="max-w-full h-32 rounded border"
            controls
            preload="metadata"
          />
        </div>
      );
    }
    
    if (file.parsedData) {
      return (
        <div className="mt-2 p-2 bg-muted rounded text-xs">
          <p className="font-medium">解析结果:</p>
          {file.parsedData.totalRows && (
            <p>数据行数: {file.parsedData.totalRows}</p>
          )}
          {file.parsedData.totalColumns && (
            <p>列数: {file.parsedData.totalColumns}</p>
          )}
        </div>
      );
    }
    
    return null;
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
                  支持Excel、CSV、图片、视频等多种格式，自动解析数据
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv,.txt,.json,.pdf,.jpg,.jpeg,.png,.mp4,.avi,.mov"
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
                  <Button 
                    onClick={handleUpload} 
                    disabled={!selectedCategory || !selectedModel || files.length === 0}
                    className="min-w-[120px]"
                  >
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

          {/* 已上传文件 */}
          {uploadedFiles.length > 0 && (
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle>已上传文件 ({uploadedFiles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {file.type.startsWith('image/') && <Image className="w-8 h-8 text-green-600" />}
                          {file.type.startsWith('video/') && <Video className="w-8 h-8 text-blue-600" />}
                          {(file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) && 
                            <FileText className="w-8 h-8 text-orange-600" />}
                          {!file.type.startsWith('image/') && !file.type.startsWith('video/') && 
                            !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv') &&
                            <FileText className="w-8 h-8 text-gray-600" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <div className="flex gap-2">
                              {file.url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${file.url}`, '_blank')}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  预览
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/files/${file.id}/download`, '_blank')}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                下载
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-2">
                            <span>{formatFileSize(file.size)}</span>
                            {file.processingResults && (
                              <Badge variant="secondary" className="ml-2">
                                已解析
                              </Badge>
                            )}
                          </div>
                          
                          {renderFilePreview(file)}
                        </div>
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