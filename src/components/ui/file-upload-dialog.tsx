import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  FileSpreadsheet, 
  File, 
  X, 
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnailUrl?: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  parsedData?: any;
  processingResults?: any;
}

interface FileUploadDialogProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/*',
  'video/*',
  '.xlsx', '.xls', '.csv',
  '.pdf', '.doc', '.docx',
  '.txt', '.json'
];

const FILE_TYPE_ICONS = {
  'image': Image,
  'video': Video,
  'spreadsheet': FileSpreadsheet,
  'document': FileText,
  'default': File
};

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  onFilesUploaded,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFiles = 10,
  maxFileSize = 100
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileCategory = (type: string): string => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return 'spreadsheet';
    if (type.includes('document') || type.includes('pdf') || type.includes('text')) return 'document';
    return 'default';
  };

  const getFileIcon = (type: string) => {
    const category = getFileCategory(type);
    const IconComponent = FILE_TYPE_ICONS[category as keyof typeof FILE_TYPE_ICONS];
    return <IconComponent className="w-8 h-8" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // 检查文件大小
    if (file.size > maxFileSize * 1024 * 1024) {
      return `文件大小超过 ${maxFileSize}MB 限制`;
    }
    
    // 检查文件类型
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });
    
    if (!isAccepted) {
      return '不支持的文件类型';
    }
    
    return null;
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(fileList).forEach((file, index) => {
      if (files.length + newFiles.length >= maxFiles) {
        toast.error(`最多只能上传 ${maxFiles} 个文件`);
        return;
      }

      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }

      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        status: 'pending'
      };

      newFiles.push(uploadedFile);
    });

    setFiles(prev => [...prev, ...newFiles]);
    
    // 开始上传每个文件
    newFiles.forEach(uploadedFile => {
      uploadFile(uploadedFile, fileList);
    });
  };

  const uploadFile = async (uploadedFile: UploadedFile, fileList: FileList) => {
    const file = Array.from(fileList).find(f => f.name === uploadedFile.name);
    if (!file) return;

    try {
      // 更新状态为上传中
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { ...f, status: 'uploading' } : f
      ));

      // 转换为Base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // 移除data:...;base64,前缀
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === uploadedFile.id && f.uploadProgress < 90) {
            return { ...f, uploadProgress: f.uploadProgress + 10 };
          }
          return f;
        }));
      }, 200);

      // 调用后端上传API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/files/upload-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          dataBase64: base64,
          fileSize: file.size
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`上传失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      // 更新文件状态
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? {
          ...f,
          status: 'completed',
          uploadProgress: 100,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          parsedData: result.parsedData
        } : f
      ));

      toast.success(`${file.name} 上传成功`);
      
    } catch (error) {
      console.error('文件上传错误:', error);
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { ...f, status: 'error' } : f
      ));
      toast.error(`${file.name} 上传失败`);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleUploadComplete = () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length > 0) {
      onFilesUploaded(completedFiles);
      toast.success(`成功上传 ${completedFiles.length} 个文件`);
    }
    setIsOpen(false);
    setFiles([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="hover-scale">
          <Upload className="w-4 h-4 mr-2" />
          选择文件上传
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>文件上传中心</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 文件拖拽区域 */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">拖拽文件到此处或点击选择</p>
              <p className="text-sm text-muted-foreground">
                支持图片、视频、Excel、PDF等多种格式，最大 {maxFileSize}MB，最多 {maxFiles} 个文件
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              选择文件
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept={acceptedTypes.join(',')}
              onChange={handleFileInputChange}
            />
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">文件列表 ({files.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <Card key={file.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-3">
                        {/* 文件图标 */}
                        <div className="flex-shrink-0">
                          {getFileIcon(file.type)}
                        </div>
                        
                        {/* 文件信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{formatFileSize(file.size)}</span>
                              <Badge 
                                variant={
                                  file.status === 'completed' ? 'default' :
                                  file.status === 'error' ? 'destructive' :
                                  file.status === 'uploading' ? 'secondary' : 'outline'
                                }
                              >
                                {file.status === 'pending' && '待上传'}
                                {file.status === 'uploading' && '上传中'}
                                {file.status === 'completed' && '已完成'}
                                {file.status === 'error' && '上传失败'}
                              </Badge>
                            </div>
                            
                            {/* 上传进度条 */}
                            {(file.status === 'uploading' || file.uploadProgress > 0) && (
                              <Progress value={file.uploadProgress} className="h-1" />
                            )}
                            
                            {/* 文件操作按钮 */}
                            {file.status === 'completed' && (
                              <div className="flex gap-1">
                                {file.url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(file.url, '_blank')}
                                    className="h-6 text-xs"
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    预览
                                  </Button>
                                )}
                                {file.parsedData && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => console.log('解析数据:', file.parsedData)}
                                    className="h-6 text-xs"
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    查看数据
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 底部操作按钮 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {files.filter(f => f.status === 'completed').length} / {files.length} 个文件上传完成
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setFiles([]);
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleUploadComplete}
                disabled={files.filter(f => f.status === 'completed').length === 0}
              >
                确认并使用文件
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;
